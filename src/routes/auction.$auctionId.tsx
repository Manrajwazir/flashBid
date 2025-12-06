import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { getAuctionById, getAuctionBids } from '../server/functions'
import { useSession } from '../lib/auth-client'
import { CountdownTimer } from '../components/ui/CountdownTimer'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { BidModal } from '../components/BidModal'
import { AuctionDetailSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ToastProvider'
import { useBidUpdates } from '../hooks/useWebSocket'
import { formatCurrency } from '../lib/utils'

export const Route = createFileRoute('/auction/$auctionId')({
    component: AuctionDetailPage,
    loader: async ({ params }) => {
        return await getAuctionById({ data: { auctionId: params.auctionId } } as any)
    },
    errorComponent: AuctionNotFound,
    pendingComponent: AuctionDetailSkeleton,
})

function AuctionNotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="text-8xl mb-6">🔍</div>
                <h1 className="text-3xl font-bold text-white mb-4">Auction Not Found</h1>
                <p className="text-gray-400 mb-8">
                    This auction may have been removed or doesn't exist.
                </p>
                <Link to="/">
                    <Button>Browse Auctions</Button>
                </Link>
            </div>
        </div>
    )
}

function AuctionDetailPage() {
    const auction = Route.useLoaderData()
    const { data: session } = useSession()
    const toast = useToast()

    const [currentPrice, setCurrentPrice] = useState(auction.currentPrice)
    const [bidHistory, setBidHistory] = useState(auction.bids)
    const [isBidModalOpen, setIsBidModalOpen] = useState(false)
    const [isAuctionEnded, setIsAuctionEnded] = useState(
        new Date(auction.endsAt) < new Date() || auction.status !== 'OPEN'
    )

    const { bids: realtimeBids, currentPrice: wsCurrentPrice } = useBidUpdates(auction.id)

    // Track previous bids length to prevent duplicate API calls
    const prevBidsLengthRef = useRef(0)
    // Track the last price we showed a notification for
    const lastNotifiedPriceRef = useRef(currentPrice)

    useEffect(() => {
        // Only show toast if:
        // 1. We have a WebSocket price
        // 2. It's higher than the current displayed price
        // 3. We haven't already notified about this price
        if (wsCurrentPrice && wsCurrentPrice > currentPrice && wsCurrentPrice !== lastNotifiedPriceRef.current) {
            lastNotifiedPriceRef.current = wsCurrentPrice
            setCurrentPrice(wsCurrentPrice)
            toast.info(`New bid: ${formatCurrency(wsCurrentPrice)}`)
        }
    }, [wsCurrentPrice]) // Only depend on wsCurrentPrice

    useEffect(() => {
        // Only fetch if we have new realtime bids that we haven't processed
        if (realtimeBids.length > 0 && realtimeBids.length !== prevBidsLengthRef.current) {
            prevBidsLengthRef.current = realtimeBids.length
            getAuctionBids({ data: { auctionId: auction.id } } as any)
                .then((bids) => setBidHistory(bids))
                .catch(console.error)
        }
    }, [realtimeBids.length, auction.id])

    const handleBidPlaced = (newPrice: number) => {
        setCurrentPrice(newPrice)
    }

    const handleAuctionExpire = () => {
        setIsAuctionEnded(true)
        toast.warning('This auction has ended')
    }

    const handleBidClick = () => {
        if (!session?.user) {
            if (confirm('You must be logged in to place a bid. Go to login page?')) {
                window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
            }
            return
        }
        setIsBidModalOpen(true)
    }

    return (
        <div className="min-h-screen">
            {/* Breadcrumbs */}
            <div className="bg-[#1a1025] border-b border-[#3d2a54]">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link to="/" className="text-gray-400 hover:text-purple-400 transition-colors">
                            Home
                        </Link>
                        <span className="text-gray-600">/</span>
                        <Link to="/" className="text-gray-400 hover:text-purple-400 transition-colors">
                            Auctions
                        </Link>
                        <span className="text-gray-600">/</span>
                        <span className="text-white font-medium truncate max-w-xs">
                            {auction.title}
                        </span>
                    </nav>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Image */}
                    <div>
                        <div className="relative rounded-lg overflow-hidden bg-[#1a1025] aspect-square border border-[#3d2a54]">
                            {auction.imageUrl ? (
                                <img
                                    src={auction.imageUrl}
                                    alt={auction.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <div className="text-6xl mb-2">📦</div>
                                        <p>No image available</p>
                                    </div>
                                </div>
                            )}

                            <div className="absolute top-4 left-4">
                                <Badge variant={isAuctionEnded ? 'neutral' : 'success'}>
                                    {isAuctionEnded ? '🔒 ENDED' : '🟢 LIVE'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-black text-white mb-2">
                                {auction.title}
                            </h1>
                            <p className="text-gray-400 leading-relaxed">
                                {auction.description}
                            </p>
                        </div>

                        {/* Timer */}
                        <div className="bg-[#1a1025] rounded-lg p-4 border border-[#3d2a54]">
                            <p className="text-sm font-semibold text-gray-400 mb-2">Time Remaining</p>
                            <CountdownTimer
                                endsAt={auction.endsAt}
                                onExpire={handleAuctionExpire}
                                size="lg"
                            />
                        </div>

                        {/* Price section */}
                        <div className="bg-[#1a1025] rounded-lg p-6 border border-[#3d2a54]">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 mb-1">Current Price</p>
                                    <p className="text-3xl font-mono font-black text-purple-400">
                                        {formatCurrency(currentPrice)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-400 mb-1">Starting Price</p>
                                    <p className="text-xl font-mono font-bold text-gray-500">
                                        {formatCurrency(auction.startPrice)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-md border border-purple-500/30">
                                    <span className="text-purple-400">👥</span>
                                    <span className="text-sm font-bold text-purple-400">
                                        {auction._count.bids} bid{auction._count.bids !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            <Button
                                onClick={handleBidClick}
                                className="w-full"
                                disabled={isAuctionEnded || session?.user?.id === auction.seller.id}
                            >
                                {isAuctionEnded
                                    ? 'Auction Ended'
                                    : session?.user?.id === auction.seller.id
                                        ? "You can't bid on your own auction"
                                        : 'Place Bid'}
                            </Button>
                        </div>

                        {/* Seller info */}
                        <div className="bg-[#1a1025] rounded-lg p-4 border border-[#3d2a54]">
                            <p className="text-sm font-semibold text-gray-400 mb-3">Seller</p>
                            <div className="flex items-center gap-3">
                                <img
                                    src={auction.seller.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(auction.seller.name || 'User')}&background=7c3aed&color=fff`}
                                    alt={auction.seller.name || 'Seller'}
                                    className="w-12 h-12 rounded-md ring-2 ring-purple-500"
                                />
                                <div>
                                    <p className="font-bold text-white">{auction.seller.name || 'Anonymous'}</p>
                                    <p className="text-sm text-gray-500">
                                        Member since {new Date(auction.seller.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bid History */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Bid History</h2>

                    {bidHistory.length === 0 ? (
                        <div className="bg-[#1a1025] rounded-lg p-8 border border-[#3d2a54] text-center">
                            <div className="text-4xl mb-3">🏷️</div>
                            <p className="text-gray-400">No bids yet. Be the first to bid!</p>
                        </div>
                    ) : (
                        <div className="bg-[#1a1025] rounded-lg border border-[#3d2a54] overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#0f0a1a] border-b border-[#3d2a54]">
                                        <th className="text-left py-3 px-4 font-bold text-gray-400">Bidder</th>
                                        <th className="text-right py-3 px-4 font-bold text-gray-400">Amount</th>
                                        <th className="text-right py-3 px-4 font-bold text-gray-400">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bidHistory.map((bid: any, index: number) => (
                                        <tr
                                            key={bid.id}
                                            className={`border-b border-[#3d2a54] ${index === 0 ? 'bg-purple-500/10' : ''}`}
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={bid.bidder.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(bid.bidder.name || 'User')}&background=6B7280&color=fff&size=32`}
                                                        alt={bid.bidder.name || 'Bidder'}
                                                        className="w-8 h-8 rounded-md"
                                                    />
                                                    <span className="font-medium text-white">
                                                        {bid.bidder.name || 'Anonymous'}
                                                    </span>
                                                    {index === 0 && (
                                                        <Badge variant="success">Winning</Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className="font-mono font-bold text-purple-400">
                                                    {formatCurrency(bid.amount)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-500 text-sm">
                                                {new Date(bid.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {session?.user && (
                <BidModal
                    isOpen={isBidModalOpen}
                    onClose={() => setIsBidModalOpen(false)}
                    auction={{ ...auction, currentPrice }}
                    userId={session.user.id}
                    onBidPlaced={handleBidPlaced}
                />
            )}
        </div>
    )
}
