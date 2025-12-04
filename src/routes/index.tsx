import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-black mb-4">FlashBid ⚡️</h1>
      <p className="text-xl text-gray-600">
        System Status: <span className="text-green-600 font-bold">ONLINE</span>
      </p>
      <p className="mt-4">
        Ready to fetch auctions...
      </p>
    </div>
  )
}