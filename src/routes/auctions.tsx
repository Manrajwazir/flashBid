import { createFileRoute, Link } from '@tanstack/react-router'
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

export const Route = createFileRoute('/auctions')({
  component: AuctionsPage,
  loader: async () => {
    const result = await getAuctions({ data: { limit: 100 } } as any)
    return result
  },
  pendingComponent: AuctionsPageLoading,
})

function AuctionsPageLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-40 bg-[#21262d] rounded-md animate-pulse" />
        <div className="h-6 w-24 bg-[#21262d] rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <AuctionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function AuctionsPage() {
  const loaderData = Route.useLoaderData()
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

  const handleBidPlaced = (_newPrice: number) => {
    toast.success('Bid placed successfully!')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#0d1117] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-[#e6edf3]">
          Live Auctions
        </h1>
        <div className="flex gap-2 items-center">
          <ConnectionStatus />
          <span className="px-2 py-1 bg-[#238636]/20 text-[#3fb950] rounded-md text-xs font-medium">
            🟢 LIVE
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-[#161b22] rounded-md border border-[#30363d] p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none text-sm"
            />
          </div>

          {/* Min Price */}
          <div>
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none text-sm"
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
              className="w-full px-3 py-2 rounded-md bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder-[#6e7681] focus:border-[#58a6ff] focus:outline-none text-sm"
              step="1"
              min="0"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-[#8b949e]">Sort by:</span>
            <div className="flex gap-1 flex-wrap">
              {[
                { value: 'endingSoon', label: 'Ending Soon' },
                { value: 'priceLow', label: 'Price: Low' },
                { value: 'priceHigh', label: 'Price: High' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as typeof sortBy)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sortBy === option.value
                    ? 'bg-[#1f6feb] text-white'
                    : 'bg-[#21262d] text-[#8b949e] hover:bg-[#30363d] hover:text-[#e6edf3]'
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
        <p className="text-xs text-[#8b949e]">
          Showing <span className="text-[#e6edf3]">{paginatedAuctions.length}</span> of{' '}
          <span className="text-[#e6edf3]">{filteredAuctions.length}</span> auctions
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedAuctions.map((auction) => (
              <div
                key={auction.id}
                className="group bg-[#161b22] rounded-md border border-[#30363d] hover:border-[#8b949e] transition-colors overflow-hidden"
              >
                {/* Image - Click to go to detail */}
                <Link to="/auction/$auctionId" params={{ auctionId: auction.id }}>
                  <div className="h-48 bg-[#0d1117] relative overflow-hidden cursor-pointer">
                    {auction.imageUrl ? (
                      <img
                        src={auction.imageUrl}
                        alt={auction.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6e7681]">
                        <div className="text-center">
                          <div className="text-3xl mb-1">📦</div>
                          <p className="text-xs">No Image</p>
                        </div>
                      </div>
                    )}
                    {/* Countdown badge */}
                    <div className="absolute top-2 right-2">
                      <CompactCountdown endsAt={auction.endsAt} />
                    </div>
                    {/* Bid count */}
                    {auction._count?.bids > 0 && (
                      <div className="absolute bottom-2 left-2 bg-[#0d1117]/90 px-2 py-1 rounded-md text-xs font-medium text-[#58a6ff]">
                        🔥 {auction._count.bids} bid{auction._count.bids !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link to="/auction/$auctionId" params={{ auctionId: auction.id }}>
                    <h2 className="text-sm font-semibold text-[#e6edf3] mb-1 line-clamp-1 hover:text-[#58a6ff] transition-colors cursor-pointer">
                      {auction.title}
                    </h2>
                  </Link>
                  <p className="text-[#8b949e] text-xs mb-4 line-clamp-2">
                    {auction.description}
                  </p>

                  <div className="flex justify-between items-end border-t border-[#30363d] pt-3">
                    <div>
                      <p className="text-xs text-[#6e7681] mb-0.5">
                        Current Price
                      </p>
                      <p className="text-lg font-mono font-semibold text-[#3fb950]">
                        {formatCurrency(auction.currentPrice)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleBidClick(auction)}
                      className="bg-[#1f6feb] hover:bg-[#388bfd] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
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