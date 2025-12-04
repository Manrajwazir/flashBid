import { createFileRoute } from '@tanstack/react-router'
import { getAuctions } from '../server/functions'

export const Route = createFileRoute('/')({
  component: Home,
  // LOADER: This runs on the server before the page renders
  loader: async () => await getAuctions(),
})

function Home() {
  // HOOK: This grabs the data returned by the loader
  const auctions = Route.useLoaderData()

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">
          FlashBid <span className="text-blue-600">⚡️</span>
        </h1>
        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-200">
           {auctions.length} Active Auctions
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {auctions.map((auction) => (
          <div key={auction.id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            
            {/* Image Section */}
            <div className="h-56 bg-gray-100 relative overflow-hidden">
              {auction.imageUrl ? (
                <img 
                  src={auction.imageUrl} 
                  alt={auction.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                {auction.title}
              </h2>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                {auction.description}
              </p>
              
              <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Current Price</p>
                  <p className="text-2xl font-mono font-black text-green-600">
                    ${auction.currentPrice.toFixed(2)}
                  </p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-blue-200">
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