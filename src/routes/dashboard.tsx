import { createFileRoute, Link } from '@tanstack/react-router'
import { useSession, getCurrentUserId, setCurrentUserId } from '../lib/auth-client'
import { useState, useEffect } from 'react'
import { getUserBids, getUserAuctions, getWonAuctions, getSoldAuctions, deleteAuction, closeExpiredAuctions } from '../server/functions'
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
    const [wonAuctions, setWonAuctions] = useState<any[]>([])
    const [soldAuctions, setSoldAuctions] = useState<any[]>([])
    const [dataLoading, setDataLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'bids' | 'listings' | 'won' | 'sold'>('bids')
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    useEffect(() => {
        // Sync user ID with session
        if (session?.user?.id) {
            setCurrentUserId(session.user.id)
        } else if (!isPending) {
            setCurrentUserId(null)
        }

        async function loadData() {
            const userId = getCurrentUserId()
            if (!userId) {
                setDataLoading(false)
                return
            }

            try {
                // First, ensure any expired auctions are processed so they show up in Won/Sold
                await closeExpiredAuctions()

                const [bidsResult, auctionsResult, wonResult, soldResult] = await Promise.all([
                    getUserBids({ data: { userId } } as any),
                    getUserAuctions({ data: { userId } } as any),
                    getWonAuctions({ data: { userId } } as any),
                    getSoldAuctions({ data: { userId } } as any),
                ])
                setBids(bidsResult)
                setAuctions(auctionsResult)
                setWonAuctions(wonResult)
                setSoldAuctions(soldResult)
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
            const [bidsResult, auctionsResult, wonResult, soldResult] = await Promise.all([
                getUserBids({ data: { userId } } as any),
                getUserAuctions({ data: { userId } } as any),
                getWonAuctions({ data: { userId } } as any),
                getSoldAuctions({ data: { userId } } as any),
            ])
            setBids(bidsResult)
            setAuctions(auctionsResult)
            setWonAuctions(wonResult)
            setSoldAuctions(soldResult)
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
        <div className="min-h-screen py-8 px-4 bg-[#0d1117]">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-[#e6edf3] mb-1">Dashboard</h1>
                    <p className="text-sm text-[#8b949e]">Manage your bids and listings</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#161b22] rounded-md p-4 border border-[#30363d]">
                        <div className="text-2xl mb-1">🎯</div>
                        <p className="text-xs text-[#8b949e]">Active Bids</p>
                        <p className="text-xl font-semibold text-[#e6edf3]">{bids.length}</p>
                    </div>
                    <div className="bg-[#161b22] rounded-md p-4 border border-[#30363d]">
                        <div className="text-2xl mb-1">📦</div>
                        <p className="text-xs text-[#8b949e]">Your Listings</p>
                        <p className="text-xl font-semibold text-[#e6edf3]">{auctions.length}</p>
                    </div>
                    <div className="bg-[#161b22] rounded-md p-4 border border-[#30363d]">
                        <div className="text-2xl mb-1">🏆</div>
                        <p className="text-xs text-[#8b949e]">Winning Bids</p>
                        <p className="text-xl font-semibold text-[#3fb950]">
                            {bids.filter(b => b.isWinning).length}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-[#161b22] rounded-md border border-[#30363d] overflow-hidden">
                    <div className="border-b border-[#30363d]">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab('bids')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'bids'
                                    ? 'bg-[#1f6feb] text-white'
                                    : 'bg-[#0d1117] text-[#8b949e] hover:text-[#e6edf3]'
                                    }`}
                            >
                                My Bids ({bids.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('listings')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'listings'
                                    ? 'bg-[#1f6feb] text-white'
                                    : 'bg-[#0d1117] text-[#8b949e] hover:text-[#e6edf3]'
                                    }`}
                            >
                                My Listings ({auctions.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('won')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'won'
                                    ? 'bg-[#1f6feb] text-white'
                                    : 'bg-[#0d1117] text-[#8b949e] hover:text-[#e6edf3]'
                                    }`}
                            >
                                Won ({wonAuctions.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('sold')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'sold'
                                    ? 'bg-[#1f6feb] text-white'
                                    : 'bg-[#0d1117] text-[#8b949e] hover:text-[#e6edf3]'
                                    }`}
                            >
                                Sold ({soldAuctions.length})
                            </button>
                        </nav>
                    </div>

                    <div className="p-4">
                        {activeTab === 'bids' && <MyBids bids={bids} />}
                        {activeTab === 'listings' && (
                            <MyListings
                                auctions={auctions}
                                onDelete={handleDelete}
                                isDeleting={isDeleting}
                            />
                        )}
                        {activeTab === 'won' && <WonAuctions auctions={wonAuctions} />}
                        {activeTab === 'sold' && <SoldAuctions auctions={soldAuctions} />}
                    </div>
                </div>
            </div>
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen py-8 px-4 bg-[#0d1117]">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Skeleton className="h-8 w-40 mb-2" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-md" />
                    ))}
                </div>
                <div className="bg-[#161b22] rounded-md border border-[#30363d] overflow-hidden">
                    <div className="border-b border-[#30363d] flex">
                        <Skeleton className="flex-1 h-12" />
                        <Skeleton className="flex-1 h-12" />
                    </div>
                    <div className="p-4 space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-20 rounded-md" />
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
            <div className="text-center py-8">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-base font-medium text-[#e6edf3] mb-1">No Bids Yet</h3>
                <p className="text-sm text-[#8b949e] mb-4">Start bidding on auctions to see them here</p>
                <Link to="/welcome">
                    <Button>Browse Auctions</Button>
                </Link>
            </div>
        )
    }

    // Helper to check if auction has ended
    const isAuctionEnded = (auction: any) => {
        return auction.status === 'CLOSED' || new Date(auction.endsAt) < new Date()
    }

    return (
        <div className="space-y-3">
            {bids.map((bid) => {
                const ended = isAuctionEnded(bid.auction)
                const isWinner = bid.isWinning

                // Determine badge status
                let badgeVariant: 'success' | 'danger' | 'warning' | 'neutral'
                let badgeText: string

                if (ended) {
                    if (isWinner) {
                        badgeVariant = 'success'
                        badgeText = '🏆 WON'
                    } else {
                        badgeVariant = 'danger'
                        badgeText = '✗ LOST'
                    }
                } else {
                    if (isWinner) {
                        badgeVariant = 'warning'
                        badgeText = '✓ WINNING'
                    } else {
                        badgeVariant = 'danger'
                        badgeText = '✗ OUTBID'
                    }
                }

                return (
                    <Link
                        key={bid.id}
                        to="/auction/$auctionId"
                        params={{ auctionId: bid.auction.id }}
                        className={`flex items-center gap-4 p-3 rounded-md border transition-colors bg-[#0d1117] ${ended
                            ? (isWinner ? 'border-[#238636]' : 'border-[#30363d] opacity-75')
                            : 'border-[#30363d] hover:border-[#8b949e]'
                            }`}
                    >
                        {bid.auction.imageUrl && (
                            <img
                                src={bid.auction.imageUrl}
                                alt={bid.auction.title}
                                className="w-16 h-16 object-cover rounded-md"
                            />
                        )}

                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-[#e6edf3] text-sm truncate">{bid.auction.title}</h3>
                            <p className="text-[#6e7681] text-xs line-clamp-1">{bid.auction.description}</p>

                            <div className="flex items-center gap-4 mt-2">
                                <div>
                                    <span className="text-xs text-[#6e7681]">Your Bid</span>
                                    <p className="font-mono font-semibold text-sm text-[#3fb950]">{formatCurrency(bid.amount)}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-[#6e7681]">{ended ? 'Final Price' : 'Current'}</span>
                                    <p className="font-mono font-semibold text-sm text-[#e6edf3]">{formatCurrency(bid.auction.currentPrice)}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-[#6e7681]">{ended ? 'Status' : 'Ends'}</span>
                                    {ended ? (
                                        <p className="text-xs text-[#8b949e]">Ended</p>
                                    ) : (
                                        <CompactCountdown endsAt={bid.auction.endsAt} />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                            <Badge variant={badgeVariant}>
                                {badgeText}
                            </Badge>
                            <p className="text-xs text-[#6e7681] mt-1">
                                {new Date(bid.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </Link>
                )
            })}
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
            <div className="text-center py-8">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="text-base font-medium text-[#e6edf3] mb-1">No Listings Yet</h3>
                <p className="text-sm text-[#8b949e] mb-4">Create your first auction to start selling</p>
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
                    <tr className="border-b border-[#30363d]">
                        <th className="text-left py-2 px-3 text-xs font-medium text-[#8b949e]">Item</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-[#8b949e]">Price</th>
                        <th className="text-center py-2 px-3 text-xs font-medium text-[#8b949e]">Bids</th>
                        <th className="text-center py-2 px-3 text-xs font-medium text-[#8b949e]">Time</th>
                        <th className="text-center py-2 px-3 text-xs font-medium text-[#8b949e]">Status</th>
                        <th className="text-center py-2 px-3 text-xs font-medium text-[#8b949e]">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {auctions.map((auction) => (
                        <tr key={auction.id} className="border-b border-[#30363d] hover:bg-[#161b22]">
                            <td className="py-3 px-3">
                                <Link to="/auction/$auctionId" params={{ auctionId: auction.id }} className="flex items-center gap-2 hover:opacity-80">
                                    {auction.imageUrl && (
                                        <img
                                            src={auction.imageUrl}
                                            alt={auction.title}
                                            className="w-12 h-12 object-cover rounded-md"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium text-sm text-[#e6edf3] hover:text-[#58a6ff]">{auction.title}</p>
                                        <p className="text-xs text-[#6e7681] line-clamp-1">{auction.description}</p>
                                    </div>
                                </Link>
                            </td>
                            <td className="py-3 px-3">
                                <p className="font-mono font-semibold text-sm text-[#3fb950]">
                                    {formatCurrency(auction.currentPrice)}
                                </p>
                            </td>
                            <td className="py-3 px-3 text-center">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#58a6ff]/20 text-[#58a6ff] rounded-md text-xs font-medium">
                                    {auction._count.bids}
                                </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                                <CompactCountdown endsAt={auction.endsAt} />
                            </td>
                            <td className="py-3 px-3 text-center">
                                {/* Computed Status */}
                                {(() => {
                                    const isEnded = new Date(auction.endsAt) < new Date() || auction.status === 'CLOSED'
                                    const hasBids = auction._count.bids > 0

                                    if (isEnded) {
                                        if (hasBids) {
                                            return <Badge variant="success">SOLD</Badge>
                                        } else {
                                            return <Badge variant="neutral">EXPIRED</Badge>
                                        }
                                    } else {
                                        return <Badge variant="success" className="animate-pulse">ACTIVE</Badge>
                                    }
                                })()}
                            </td>
                            <td className="py-3 px-3 text-center">
                                {auction._count.bids === 0 ? (
                                    <Button
                                        variant="danger"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            onDelete(auction.id)
                                        }}
                                        isLoading={isDeleting === auction.id}
                                        disabled={isDeleting === auction.id}
                                        className="!px-3 !py-1 !text-xs"
                                    >
                                        Delete
                                    </Button>
                                ) : (
                                    <span className="text-xs text-[#6e7681]">Has bids</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function WonAuctions({ auctions }: { auctions: any[] }) {
    if (auctions.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="text-base font-medium text-[#e6edf3] mb-1">No Auctions Won Yet</h3>
                <p className="text-sm text-[#8b949e] mb-4">Keep bidding to win awesome items!</p>
                <Link to="/">
                    <Button>Browse Auctions</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {auctions.map((auction) => (
                <div key={auction.id} className="bg-[#0d1117] rounded-md border border-[#238636] p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {auction.imageUrl && (
                            <img
                                src={auction.imageUrl}
                                alt={auction.title}
                                className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                            />
                        )}
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-[#e6edf3] text-lg">{auction.title}</h3>
                                    <p className="text-sm text-[#8b949e] mb-2">{auction.description}</p>
                                </div>
                                <Badge variant="success">YOU WON</Badge>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm text-[#8b949e]">Winning Price:</span>
                                <span className="text-xl font-bold text-[#3fb950]">{formatCurrency(auction.currentPrice)}</span>
                            </div>

                            <div className="bg-[#161b22] rounded p-3 border border-[#30363d] flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-[#8b949e]">Seller Contact</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-6 h-6 rounded-full bg-[#30363d] flex items-center justify-center text-xs overflow-hidden">
                                            {auction.seller.image ? (
                                                <img src={auction.seller.image} alt={auction.seller.name || 'Seller'} />
                                            ) : (
                                                <span>👤</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[#e6edf3]">{auction.seller.name || 'Unknown Seller'}</p>
                                            <p className="text-xs text-[#58a6ff]">{auction.seller.email || 'No email provided'}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="secondary" onClick={() => window.location.href = `mailto:${auction.seller.email}?subject=Payment for ${auction.title}`}>
                                    Email Seller
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function SoldAuctions({ auctions }: { auctions: any[] }) {
    if (auctions.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="text-base font-medium text-[#e6edf3] mb-1">No Items Sold Yet</h3>
                <p className="text-sm text-[#8b949e] mb-4">List more items to start earning!</p>
                <Link to="/sell">
                    <Button>List Item</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {auctions.map((auction) => (
                <div key={auction.id} className="bg-[#0d1117] rounded-md border border-[#58a6ff] p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {auction.imageUrl && (
                            <img
                                src={auction.imageUrl}
                                alt={auction.title}
                                className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                            />
                        )}
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-[#e6edf3] text-lg">{auction.title}</h3>
                                    <p className="text-sm text-[#8b949e] mb-2">{auction.description}</p>
                                </div>
                                <Badge variant="info">SOLD</Badge>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm text-[#8b949e]">Sold For:</span>
                                <span className="text-xl font-bold text-[#58a6ff]">{formatCurrency(auction.currentPrice)}</span>
                            </div>

                            <div className="bg-[#161b22] rounded p-3 border border-[#30363d] flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-[#8b949e]">Winner</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-6 h-6 rounded-full bg-[#30363d] flex items-center justify-center text-xs overflow-hidden">
                                            {auction.winner?.image ? (
                                                <img src={auction.winner.image} alt={auction.winner.name || 'Winner'} />
                                            ) : (
                                                <span>👤</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[#e6edf3]">{auction.winner?.name || 'Unknown Winner'}</p>
                                            <p className="text-xs text-[#58a6ff]">{auction.winner?.email || 'No email provided'}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="secondary" onClick={() => window.location.href = `mailto:${auction.winner?.email}?subject=Payment for ${auction.title}`}>
                                    Email Winner
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
