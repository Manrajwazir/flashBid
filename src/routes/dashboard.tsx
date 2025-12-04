import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useSession } from '../lib/auth-client'
import { useState } from 'react'
import { getUserBids, getUserAuctions, deleteAuction } from '../server/functions'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export const Route = createFileRoute('/dashboard')({
    component: DashboardPage,
    loader: async () => {
        const [bids, auctions] = await Promise.all([
            getUserBids(),
            getUserAuctions(),
        ])
        return { bids, auctions }
    },
})

function DashboardPage() {
    const { data: session, isPending } = useSession()
    const loaderData = Route.useLoaderData()
    const [activeTab, setActiveTab] = useState<'bids' | 'listings'>('bids')
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const router = useRouter()

    // Redirect if not logged in
    if (!isPending && !session?.user) {
        window.location.href = `/login?redirect=${encodeURIComponent('/dashboard')}`
        return null
    }

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const handleDelete = async (auctionId: string) => {
        if (!confirm('Are you sure you want to delete this auction?')) return

        setIsDeleting(auctionId)
        try {
            await deleteAuction({ data: { auctionId } } as any)
            router.invalidate()
        } catch (error: any) {
            alert(error.message || 'Failed to delete auction')
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600">Manage your bids and listings</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab('bids')}
                                className={`flex-1 px-6 py-4 font-bold transition-all ${activeTab === 'bids'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                My Bids ({loaderData.bids.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('listings')}
                                className={`flex-1 px-6 py-4 font-bold transition-all ${activeTab === 'listings'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                My Listings ({loaderData.auctions.length})
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'bids' ? (
                            <MyBids bids={loaderData.bids} />
                        ) : (
                            <MyListings
                                auctions={loaderData.auctions}
                                onDelete={handleDelete}
                                isDeleting={isDeleting}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function MyBids({ bids }: { bids: any[] }) {
    if (bids.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Bids Yet</h3>
                <p className="text-gray-600 mb-6">Start bidding on auctions to see them here</p>
                <Button onClick={() => window.location.href = '/'}>
                    Browse Auctions
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {bids.map((bid) => (
                <div
                    key={bid.id}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
                >
                    {bid.auction.imageUrl && (
                        <img
                            src={bid.auction.imageUrl}
                            alt={bid.auction.title}
                            className="w-24 h-24 object-cover rounded-lg"
                        />
                    )}

                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{bid.auction.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-1">{bid.auction.description}</p>

                        <div className="flex items-center gap-4 mt-2">
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Your Bid</span>
                                <p className="font-mono font-bold text-blue-600">${bid.amount.toFixed(2)}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Current Price</span>
                                <p className="font-mono font-bold text-gray-900">${bid.auction.currentPrice.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        {bid.isWinning ? (
                            <Badge variant="success">
                                ✓ WINNING
                            </Badge>
                        ) : (
                            <Badge variant="danger">
                                ✗ OUTBID
                            </Badge>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

function MyListings({
    auctions,
    onDelete,
    isDeleting
}: {
    auctions: any[]
    onDelete: (id: string) => void
    isDeleting: string | null
}) {
    if (auctions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Listings Yet</h3>
                <p className="text-gray-600 mb-6">Create your first auction to start selling</p>
                <Button onClick={() => window.location.href = '/sell'}>
                    Create Auction
                </Button>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-gray-700">Item</th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">Current Price</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-700">Bids</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-700">Status</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {auctions.map((auction) => (
                        <tr key={auction.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                    {auction.imageUrl && (
                                        <img
                                            src={auction.imageUrl}
                                            alt={auction.title}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                    )}
                                    <div>
                                        <p className="font-bold text-gray-900">{auction.title}</p>
                                        <p className="text-sm text-gray-500 line-clamp-1">{auction.description}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-4">
                                <p className="font-mono font-bold text-green-600">
                                    ${auction.currentPrice.toFixed(2)}
                                </p>
                            </td>
                            <td className="py-4 px-4 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                                    {auction._count.bids}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                                <Badge
                                    variant={
                                        auction.status === 'OPEN' ? 'success' :
                                            auction.status === 'CLOSED' ? 'neutral' :
                                                'danger'
                                    }
                                >
                                    {auction.status}
                                </Badge>
                            </td>
                            <td className="py-4 px-4 text-center">
                                {auction._count.bids === 0 ? (
                                    <Button
                                        variant="danger"
                                        onClick={() => onDelete(auction.id)}
                                        isLoading={isDeleting === auction.id}
                                        disabled={isDeleting === auction.id}
                                        className="!px-4 !py-1.5 !text-sm"
                                    >
                                        Delete
                                    </Button>
                                ) : (
                                    <span className="text-xs text-gray-400">Has bids</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
