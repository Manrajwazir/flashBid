import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getAuctions, placeBid } from '../server/functions'
import { useEffect, useState } from 'react'
import { useSession } from '../lib/auth-client'

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await getAuctions({ data: undefined } as any),
})

function Home() {
  const auctions = Route.useLoaderData()
  const router = useRouter()
  const { data: session } = useSession()

  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState<'endingSoon' | 'priceLow' | 'priceHigh'>('endingSoon')
  const [filteredAuctions, setFilteredAuctions] = useState(auctions)

  // --- THE REAL-TIME MAGIC ---
  // This refreshes the data every 2 seconds automatically
  useEffect(() => {
    const interval = setInterval(() => {
      router.invalidate()
    }, 2000)
    return () => clearInterval(interval)
  }, [router])
  // ---------------------------

  // Apply filters locally
  useEffect(() => {
    let filtered = [...auctions]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(auction =>
        auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auction.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Price filters
    if (minPrice) {
      filtered = filtered.filter(auction => auction.currentPrice >= parseFloat(minPrice))
    }
    if (maxPrice) {
      filtered = filtered.filter(auction => auction.currentPrice <= parseFloat(maxPrice))
    }

    // Sort
    if (sortBy === 'endingSoon') {
      filtered.sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime())
    } else if (sortBy === 'priceLow') {
      filtered.sort((a, b) => a.currentPrice - b.currentPrice)
    } else if (sortBy === 'priceHigh') {
      filtered.sort((a, b) => b.currentPrice - a.currentPrice)
    }

    setFilteredAuctions(filtered)
  }, [auctions, searchQuery, minPrice, maxPrice, sortBy])

  const handleBid = async (auctionId: string, currentPrice: number) => {
    // Check if user is logged in
    if (!session?.user) {
      const shouldLogin = confirm('You must be logged in to place a bid. Go to login page?')
      if (shouldLogin) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      }
      return
    }

    const amountStr = window.prompt(`Current price is $${currentPrice}. Enter your bid:`)
    if (!amountStr) return

    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= currentPrice) {
      alert("Invalid bid amount!")
      return
    }

    const result = await placeBid({ data: { auctionId, amount, userId: session.user.id } } as any)

    if (result.success) {
      router.invalidate() // Instant update for the bidder
      alert("Bid Placed! 🚀")
    } else {
      alert("Error: " + result.error)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">
          FlashBid <span className="text-blue-600">⚡️</span>
        </h1>
        <div className="flex gap-2 items-center">
          {/* Pulsing Dot Animation */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-200">
            LIVE UPDATES
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Min Price */}
          <div>
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
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
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
              step="1"
              min="0"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-bold text-gray-700">Sort by:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSortBy('endingSoon')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${sortBy === 'endingSoon'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Ending Soon
            </button>
            <button
              onClick={() => setSortBy('priceLow')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${sortBy === 'priceLow'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Price: Low to High
            </button>
            <button
              onClick={() => setSortBy('priceHigh')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${sortBy === 'priceHigh'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Price: High to Low
            </button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600">
          Showing <span className="font-bold">{filteredAuctions.length}</span> of <span className="font-bold">{auctions.length}</span> auctions
        </p>
      </div>

      {/* Auctions Grid */}
      {filteredAuctions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No auctions found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAuctions.map((auction) => (
            <div key={auction.id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">

              <div className="h-56 bg-gray-100 relative overflow-hidden">
                {auction.imageUrl ? (
                  <img
                    src={auction.imageUrl}
                    alt={auction.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  ENDS IN 24H
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{auction.title}</h2>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{auction.description}</p>

                <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Current Price</p>
                    {/* We added a key here so React animates the number change */}
                    <p key={auction.currentPrice} className="text-2xl font-mono font-black text-green-600 animate-pulse">
                      ${auction.currentPrice.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleBid(auction.id, auction.currentPrice)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-blue-200 cursor-pointer active:scale-95"
                  >
                    Bid Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}