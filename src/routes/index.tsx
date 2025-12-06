import { createFileRoute, useRouter, Link } from '@tanstack/react-router'
import { getAuctions } from '../server/functions'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSession } from '../lib/auth-client'
import { CompactCountdown } from '../components/ui/CountdownTimer'
import { AuctionCardSkeleton } from '../components/ui/Skeleton'
import { Pagination, ItemsPerPageSelector } from '../components/ui/Pagination'
import { BidModal } from '../components/BidModal'
import { useToast } from '../components/ToastProvider'
import { useRealTimeAuctions, useOutbidNotifications } from '../hooks/useWebSocket'
import { ConnectionStatus } from '../components/ConnectionStatus'
import { formatCurrency } from '../lib/utils'

const ITEMS_PER_PAGE = 12

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const result = await getAuctions({ data: { limit: 100 } } as any)
    return result
  },
  pendingComponent: HomeLoading,
})

function HomeLoading() {
  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-10">
        <div className="h-10 w-48 bg-[#231730] rounded-md animate-pulse" />
        <div className="h-8 w-32 bg-[#231730] rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <AuctionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function Home() {
  const loaderData = Route.useLoaderData()
  const router = useRouter()
  const { data: session } = useSession()
  const toast = useToast()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState<'endingSoon' | 'priceLow' | 'priceHigh'>('endingSoon')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)

  // Bid modal state
  const [selectedAuction, setSelectedAuction] = useState<any>(null)
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)

  // Get real-time updated auctions via WebSocket
  const realTimeAuctions = useRealTimeAuctions(loaderData.auctions || [])

  // Outbid notifications
  useOutbidNotifications(session?.user?.id || null, (auctionId, newPrice) => {
    const auction = realTimeAuctions.find(a => a.id === auctionId)
    if (auction) {
      toast.warning(`You've been outbid on "${auction.title}"! New price: ${formatCurrency(newPrice)}`)
    }
  })

  // Filter and sort auctions
  const filteredAuctions = useMemo(() => {
    let filtered = [...realTimeAuctions]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (auction) =>
          auction.title.toLowerCase().includes(query) ||
          auction.description.toLowerCase().includes(query)
      )
    }

    // Price filters
    if (minPrice) {
      filtered = filtered.filter((auction) => auction.currentPrice >= parseFloat(minPrice))
    }
    if (maxPrice) {
      filtered = filtered.filter((auction) => auction.currentPrice <= parseFloat(maxPrice))
    }

    // Helper to check if auction is still active (not ended)
    const isActiveAuction = (auction: any) => {
      return new Date(auction.endsAt) > new Date()
    }

    // Sort: Active auctions first, then ended auctions
    if (sortBy === 'endingSoon') {
      filtered.sort((a, b) => {
        const aIsActive = isActiveAuction(a)
        const bIsActive = isActiveAuction(b)
        // Active auctions come first
        if (aIsActive && !bIsActive) return -1
        if (!aIsActive && bIsActive) return 1
        // Both active: sort by ending soonest
        if (aIsActive && bIsActive) {
          return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()
        }
        // Both ended: sort by most recently ended
        return new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime()
      })
    } else if (sortBy === 'priceLow') {
      filtered.sort((a, b) => {
        const aIsActive = isActiveAuction(a)
        const bIsActive = isActiveAuction(b)
        if (aIsActive !== bIsActive) return aIsActive ? -1 : 1
        if (aIsActive) return a.currentPrice - b.currentPrice
        return new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime()
      })
    } else if (sortBy === 'priceHigh') {
      filtered.sort((a, b) => {
        const aIsActive = isActiveAuction(a)
        const bIsActive = isActiveAuction(b)
        if (aIsActive !== bIsActive) return aIsActive ? -1 : 1
        if (aIsActive) return b.currentPrice - a.currentPrice
        return new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime()
      })
    }

    return filtered
  }, [realTimeAuctions, searchQuery, minPrice, maxPrice, sortBy])

  // Paginate
  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage)
  const paginatedAuctions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAuctions.slice(start, start + itemsPerPage)
  }, [filteredAuctions, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, minPrice, maxPrice, sortBy, itemsPerPage])

  const handleBidClick = useCallback((auction: any) => {
    if (!session?.user) {
      if (confirm('You must be logged in to place a bid. Go to login page?')) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      }
      return
    }
    setSelectedAuction(auction)
    setIsBidModalOpen(true)
  }, [session])

  const handleBidPlaced = (newPrice: number) => {
    toast.success('Bid placed successfully!')
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black tracking-tight text-white">
          FlashBid <span className="text-purple-400">⚡️</span>
        </h1>
        <div className="flex gap-3 items-center">
          <ConnectionStatus />
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-md text-sm font-bold border border-purple-500/30">
            🟢 LIVE
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 bg-[#1a1025] rounded-lg border border-[#3d2a54] p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-[#0f0a1a] border border-[#3d2a54] text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Min Price */}
          <div>
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-[#0f0a1a] border border-[#3d2a54] text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              step="1"
              min="0"
            />
          </div>

          {/* Max Price */}
          <div>
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-[#0f0a1a] border border-[#3d2a54] text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              step="1"
              min="0"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-bold text-gray-400">Sort by:</span>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'endingSoon', label: 'Ending Soon' },
                { value: 'priceLow', label: 'Price: Low to High' },
                { value: 'priceHigh', label: 'Price: High to Low' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as typeof sortBy)}
                  className={`px-4 py-2 rounded-md font-semibold transition-all ${sortBy === option.value
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                    : 'bg-[#2d1f40] text-gray-300 hover:bg-[#3d2a54]'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <ItemsPerPageSelector
            value={itemsPerPage}
            onChange={setItemsPerPage}
            options={[12, 24, 48]}
          />
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-400">
          Showing <span className="font-bold text-white">{paginatedAuctions.length}</span> of{' '}
          <span className="font-bold text-white">{filteredAuctions.length}</span> auctions
        </p>
      </div>

      {/* Auctions Grid */}
      {paginatedAuctions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-white mb-2">No auctions found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedAuctions.map((auction) => (
              <div
                key={auction.id}
                className="group bg-[#1a1025] rounded-lg border border-[#3d2a54] hover:border-purple-500 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-purple-500/10"
              >
                {/* Image - Click to go to detail */}
                <Link to="/auction/$auctionId" params={{ auctionId: auction.id }}>
                  <div className="h-56 bg-[#0f0a1a] relative overflow-hidden cursor-pointer">
                    {auction.imageUrl ? (
                      <img
                        src={auction.imageUrl}
                        alt={auction.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📦</div>
                          <p className="text-sm">No Image</p>
                        </div>
                      </div>
                    )}
                    {/* Countdown badge */}
                    <div className="absolute top-3 right-3">
                      <CompactCountdown endsAt={auction.endsAt} />
                    </div>
                    {/* Bid count */}
                    {auction._count?.bids > 0 && (
                      <div className="absolute bottom-3 left-3 bg-[#1a1025]/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-purple-400 border border-purple-500/30">
                        🔥 {auction._count.bids} bid{auction._count.bids !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-6">
                  <Link to="/auction/$auctionId" params={{ auctionId: auction.id }}>
                    <h2 className="text-xl font-bold text-white mb-2 line-clamp-1 hover:text-purple-400 transition-colors cursor-pointer">
                      {auction.title}
                    </h2>
                  </Link>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {auction.description}
                  </p>

                  <div className="flex justify-between items-end border-t border-[#3d2a54] pt-4">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                        Current Price
                      </p>
                      <p className="text-2xl font-mono font-black text-purple-400">
                        {formatCurrency(auction.currentPrice)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleBidClick(auction)}
                      className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white px-6 py-2.5 rounded-md font-bold transition-all cursor-pointer active:scale-95"
                    >
                      Bid Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Bid Modal */}
      {session?.user && selectedAuction && (
        <BidModal
          isOpen={isBidModalOpen}
          onClose={() => {
            setIsBidModalOpen(false)
            setSelectedAuction(null)
          }}
          auction={selectedAuction}
          userId={session.user.id}
          onBidPlaced={handleBidPlaced}
        />
      )}
    </div>
  )
}