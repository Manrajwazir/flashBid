import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getAuctions, placeBid } from '../server/functions'
import { useEffect } from 'react' // <--- Added this import

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await getAuctions(),
})

function Home() {
  const auctions = Route.useLoaderData()
  const router = useRouter()

  // --- THE REAL-TIME MAGIC ---
  // This refreshes the data every 2 seconds automatically
  useEffect(() => {
    const interval = setInterval(() => {
      router.invalidate()
    }, 2000)
    return () => clearInterval(interval)
  }, [router])
  // ---------------------------

  const handleBid = async (auctionId: string, currentPrice: number) => {
    const amountStr = window.prompt(`Current price is $${currentPrice}. Enter your bid:`)
    if (!amountStr) return

    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= currentPrice) {
      alert("Invalid bid amount!")
      return
    }

    // We cast to 'any' to bypass the typescript error we saw earlier
    const result = await placeBid({ data: { auctionId, amount } } as any)

    if (result.success) {
      router.invalidate() // Instant update for the bidder
      alert("Bid Placed! 🚀")
    } else {
      alert("Error: " + result.error)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {auctions.map((auction) => (
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
    </div>
  )
}