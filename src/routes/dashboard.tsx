import { createFileRoute, Link } from '@tanstack/react-router'
import { useSession, getCurrentUserId } from '../lib/auth-client'
import { useState, useEffect } from 'react'
import { getUserBids, getUserAuctions, deleteAuction } from '../server/functions'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { CompactCountdown } from '../components/ui/CountdownTimer'
import { Skeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ToastProvider'
import { formatCurrency } from '../lib/utils'

export const Route = createFileRoute('/dashboard')({
    component: DashboardPage,
})

function DashboardPage() {
    const { data: session, isPending } = useSession()
    const toast = useToast()
    const [bids, setBids] = useState<any[]>([])
    const [auctions, setAuctions] = useState<any[]>([])
    const [dataLoading, setDataLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'bids' | 'listings'>('bids')
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    useEffect(() => {
        async function loadData() {
            const userId = getCurrentUserId()
            if (!userId) {
                setDataLoading(false)
                return
            }

            try {
                const [bidsResult, auctionsResult] = await Promise.all([
                    getUserBids({ data: { userId } } as any),
                    getUserAuctions({ data: { userId } } as any),
                ])
                setBids(bidsResult)
                setAuctions(auctionsResult)
            } catch (error) {
                console.error('Failed to load dashboard data:', error)
                toast.error('Failed to load dashboard data')
            } finally {
                setDataLoading(false)
            }
        }

        if (!isPending && session?.user) {
            loadData()
        } else if (!isPending) {
            setDataLoading(false)
        }
    }, [isPending, session])

    const refreshData = async () => {
        const userId = getCurrentUserId()
        if (!userId) return

        try {
            const [bidsResult, auctionsResult] = await Promise.all([
                getUserBids({ data: { userId } } as any),
                getUserAuctions({ data: { userId } } as any),
            ])
            setBids(bidsResult)
            setAuctions(auctionsResult)
        } catch (error) {
            console.error('Failed to refresh data:', error)
        }
    }

    if (!isPending && !session?.user) {
        window.location.href = `/login?redirect=${encodeURIComponent('/dashboard')}`
        return null
    }

    if (isPending || dataLoading) {
        return <DashboardSkeleton />
    }

    const handleDelete = async (auctionId: string) => {
        if (!confirm('Are you sure you want to delete this auction?')) return

        const userId = getCurrentUserId()
        if (!userId) return

        setIsDeleting(auctionId)
        try {
            await deleteAuction({ data: { auctionId, userId } } as any)
            toast.success('Auction deleted successfully')
            await refreshData()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete auction')
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-white mb-2">Dashboard</h1>
                    <p className="text-gray-400">Manage your bids and listings</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#1a1025] rounded-lg p-6 border border-[#3d2a54]">
                        <div className="text-3xl mb-2">🎯</div>
                        <p className="text-sm text-gray-400 font-medium">Active Bids</p>
                        <p className="text-2xl font-black text-white">{bids.length}</p>
                    </div>
                    <div className="bg-[#1a1025] rounded-lg p-6 border border-[#3d2a54]">
                        <div className="text-3xl mb-2">📦</div>
                        <p className="text-sm text-gray-400 font-medium">Your Listings</p>
                        <p className="text-2xl font-black text-white">{auctions.length}</p>
                    </div>
                    <div className="bg-[#1a1025] rounded-lg p-6 border border-[#3d2a54]">
                        <div className="text-3xl mb-2">🏆</div>
                        <p className="text-sm text-gray-400 font-medium">Winning Bids</p>
                        <p className="text-2xl font-black text-purple-400">
                            {bids.filter(b => b.isWinning).length}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-[#1a1025] rounded-lg border border-[#3d2a54] overflow-hidden">
                    <div className="border-b border-[#3d2a54]">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab('bids')}
                                className={`flex-1 px-6 py-4 font-bold transition-all ${activeTab === 'bids'
                                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                                    : 'bg-[#0f0a1a] text-gray-400 hover:bg-[#1a1025]'
                                    }`}
                            >
                                My Bids ({bids.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('listings')}
                                className={`flex-1 px-6 py-4 font-bold transition-all ${activeTab === 'listings'
                                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                                    : 'bg-[#0f0a1a] text-gray-400 hover:bg-[#1a1025]'
                                    }`}
                            >
                                My Listings ({auctions.length})
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'bids' ? (
                            <MyBids bids={bids} />
                        ) : (
                            <MyListings
                                auctions={auctions}
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

function DashboardSkeleton() {
    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Skeleton className="h-10 w-48 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-lg" />
                    ))}
                </div>
                <div className="bg-[#1a1025] rounded-lg border border-[#3d2a54] overflow-hidden">
                    <div className="border-b border-[#3d2a54] flex">
                        <Skeleton className="flex-1 h-14" />
                        <Skeleton className="flex-1 h-14" />
                    </div>
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-24 rounded-lg" />
                        ))}
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
                <h3 className="text-xl font-bold text-white mb-2">No Bids Yet</h3>
                <p className="text-gray-400 mb-6">Start bidding on auctions to see them here</p>
                <Link to="/">
                    <Button>Browse Auctions</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {bids.map((bid) => (
                <Link
                    key={bid.id}
                    to="/auction/$auctionId"
                    params={{ auctionId: bid.auction.id }}
                    className="flex items-center gap-4 p-4 rounded-lg border border-[#3d2a54] hover:border-purple-500 transition-all bg-[#0f0a1a] hover:shadow-lg hover:shadow-purple-500/10"
                >
                    {bid.auction.imageUrl && (
                        <img
                            src={bid.auction.imageUrl}
                            alt={bid.auction.title}
                            className="w-24 h-24 object-cover rounded-md"
                        />
                    )}

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg truncate">{bid.auction.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-1">{bid.auction.description}</p>

                        <div className="flex items-center gap-4 mt-2">
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Your Bid</span>
                                <p className="font-mono font-bold text-purple-400">{formatCurrency(bid.amount)}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Current Price</span>
                                <p className="font-mono font-bold text-white">{formatCurrency(bid.auction.currentPrice)}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Ends</span>
                                <CompactCountdown endsAt={bid.auction.endsAt} />
                            </div>
                        </div>
                    </div>

                    <div className="text-right flex-shrink-0">
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
                </Link>
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
                <h3 className="text-xl font-bold text-white mb-2">No Listings Yet</h3>
                <p className="text-gray-400 mb-6">Create your first auction to start selling</p>
                <Link to="/sell">
                    <Button>Create Auction</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-[#3d2a54]">
                        <th className="text-left py-3 px-4 font-bold text-gray-400">Item</th>
                        <th className="text-left py-3 px-4 font-bold text-gray-400">Current Price</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-400">Bids</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-400">Time Left</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-400">Status</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-400">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {auctions.map((auction) => (
                        <tr key={auction.id} className="border-b border-[#3d2a54] hover:bg-[#0f0a1a]">
                            <td className="py-4 px-4">
                                <Link to="/auction/$auctionId" params={{ auctionId: auction.id }} className="flex items-center gap-3 hover:opacity-80">
                                    {auction.imageUrl && (
                                        <img
                                            src={auction.imageUrl}
                                            alt={auction.title}
                                            className="w-16 h-16 object-cover rounded-md"
                                        />
                                    )}
                                    <div>
                                        <p className="font-bold text-white hover:text-purple-400">{auction.title}</p>
                                        <p className="text-sm text-gray-500 line-clamp-1">{auction.description}</p>
                                    </div>
                                </Link>
                            </td>
                            <td className="py-4 px-4">
                                <p className="font-mono font-bold text-purple-400">
                                    {formatCurrency(auction.currentPrice)}
                                </p>
                            </td>
                            <td className="py-4 px-4 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-500/20 text-purple-400 rounded-md font-bold text-sm border border-purple-500/30">
                                    {auction._count.bids}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                                <CompactCountdown endsAt={auction.endsAt} />
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
                                        onClick={(e) => {
                                            e.preventDefault()
                                            onDelete(auction.id)
                                        }}
                                        isLoading={isDeleting === auction.id}
                                        disabled={isDeleting === auction.id}
                                        className="!px-4 !py-1.5 !text-sm"
                                    >
                                        Delete
                                    </Button>
                                ) : (
                                    <span className="text-xs text-gray-500">Has bids</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
