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
import { AIBidAdvisor } from '../components/AIBidAdvisor'
import { AIAuctioneer } from '../components/AIAuctioneer'

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
        <div className="min-h-screen bg-[#0d1117]">
            {/* Breadcrumbs */}
            <div className="bg-[#161b22] border-b border-[#30363d]">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link to="/" className="text-[#8b949e] hover:text-[#58a6ff] transition-colors">
                            Home
                        </Link>
                        <span className="text-[#6e7681]">/</span>
                        <Link to="/" className="text-[#8b949e] hover:text-[#58a6ff] transition-colors">
                            Auctions
                        </Link>
                        <span className="text-[#6e7681]">/</span>
                        <span className="text-[#e6edf3] font-medium truncate max-w-xs">
                            {auction.title}
                        </span>
                    </nav>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* AI Auctioneer - Top of page */}
                {!isAuctionEnded && (
                    <div className="mb-6">
                        <AIAuctioneer
                            auctionTitle={auction.title}
                            currentPrice={currentPrice}
                            startPrice={auction.startPrice}
                            bidCount={bidHistory.length}
                            timeRemainingMs={new Date(auction.endsAt).getTime() - Date.now()}
                            lastBidderName={bidHistory[0]?.bidder?.name || undefined}
                            isEnded={isAuctionEnded}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Image */}
                    <div>
                        <div className="relative rounded-md overflow-hidden bg-[#161b22] aspect-square border border-[#30363d]">
                            {auction.imageUrl ? (
                                <img
                                    src={auction.imageUrl}
                                    alt={auction.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#6e7681]">
                                    <div className="text-center">
                                        <div className="text-5xl mb-2">📦</div>
                                        <p className="text-sm">No image</p>
                                    </div>
                                </div>
                            )}

                            <div className="absolute top-3 left-3">
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

                        {/* Winner Banner - Shows when auction is ended */}
                        {isAuctionEnded && bidHistory.length > 0 && (
                            <div className={`rounded-md p-4 border ${session?.user?.id === bidHistory[0]?.bidder?.id
                                    ? 'bg-[#238636]/20 border-[#238636]'
                                    : session?.user?.id === auction.seller.id
                                        ? 'bg-[#58a6ff]/20 border-[#58a6ff]'
                                        : 'bg-[#161b22] border-[#30363d]'
                                }`}>
                                {session?.user?.id === bidHistory[0]?.bidder?.id ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">🏆</span>
                                            <span className="text-xl font-bold text-[#3fb950]">You Won!</span>
                                        </div>
                                        <p className="text-[#8b949e] text-sm mb-3">
                                            Contact the seller to arrange payment and pickup.
                                        </p>
                                        <div className="bg-[#0d1117] rounded-md p-3 border border-[#30363d]">
                                            <p className="text-xs text-[#8b949e] mb-1">Seller Contact</p>
                                            <p className="text-[#e6edf3] font-medium">{auction.seller.name}</p>
                                            <p className="text-[#58a6ff] text-sm">{auction.seller.email}</p>
                                        </div>
                                    </>
                                ) : session?.user?.id === auction.seller.id ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">💰</span>
                                            <span className="text-xl font-bold text-[#58a6ff]">Item Sold!</span>
                                        </div>
                                        <p className="text-[#8b949e] text-sm mb-3">
                                            Your item sold for {formatCurrency(currentPrice)}!
                                        </p>
                                        <div className="bg-[#0d1117] rounded-md p-3 border border-[#30363d]">
                                            <p className="text-xs text-[#8b949e] mb-1">Winner</p>
                                            <p className="text-[#e6edf3] font-medium">{bidHistory[0]?.bidder?.name || 'Anonymous'}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">🔒</span>
                                            <span className="text-xl font-bold text-[#e6edf3]">Auction Ended</span>
                                        </div>
                                        <p className="text-[#8b949e] text-sm">
                                            Won by <span className="text-[#e6edf3] font-medium">{bidHistory[0]?.bidder?.name || 'Anonymous'}</span> for {formatCurrency(currentPrice)}
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* No bids message for ended auctions */}
                        {isAuctionEnded && bidHistory.length === 0 && (
                            <div className="bg-[#161b22] rounded-md p-4 border border-[#30363d]">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">😔</span>
                                    <span className="text-xl font-bold text-[#8b949e]">No Bids</span>
                                </div>
                                <p className="text-[#6e7681] text-sm">
                                    This auction ended without any bids.
                                </p>
                            </div>
                        )}

                        {/* Timer */}
                        <div className="bg-[#161b22] rounded-md p-4 border border-[#30363d]">
                            <p className="text-xs text-[#8b949e] mb-2">Time Remaining</p>
                            <CountdownTimer
                                endsAt={auction.endsAt}
                                onExpire={handleAuctionExpire}
                                size="lg"
                            />
                        </div>

                        {/* Price section */}
                        <div className="bg-[#161b22] rounded-md p-4 border border-[#30363d]">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-[#8b949e] mb-1">Current Price</p>
                                    <p className="text-2xl font-mono font-semibold text-[#3fb950]">
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

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#58a6ff]/10 rounded-md">
                                    <span className="text-[#58a6ff]">👥</span>
                                    <span className="text-sm font-medium text-[#58a6ff]">
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
                        <div className="bg-[#161b22] rounded-md p-4 border border-[#30363d]">
                            <p className="text-xs text-[#8b949e] mb-2">Seller</p>
                            <div className="flex items-center gap-3">
                                <img
                                    src={auction.seller.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(auction.seller.name || 'User')}&background=30363d&color=e6edf3`}
                                    alt={auction.seller.name || 'Seller'}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <p className="font-medium text-[#e6edf3]">{auction.seller.name || 'Anonymous'}</p>
                                    <p className="text-xs text-[#6e7681]">
                                        Member since {new Date(auction.seller.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* AI Bid Advisor */}
                        <AIBidAdvisor
                            title={auction.title}
                            description={auction.description}
                            currentPrice={currentPrice}
                            startPrice={auction.startPrice}
                            bidCount={auction._count.bids}
                            endsAt={auction.endsAt}
                            isEnded={isAuctionEnded}
                        />
                    </div>
                </div>

                {/* Bid History */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-[#e6edf3] mb-4">Bid History</h2>

                    {bidHistory.length === 0 ? (
                        <div className="bg-[#161b22] rounded-md p-6 border border-[#30363d] text-center">
                            <div className="text-3xl mb-2">🏷️</div>
                            <p className="text-[#8b949e] text-sm">No bids yet. Be the first to bid!</p>
                        </div>
                    ) : (
                        <div className="bg-[#161b22] rounded-md border border-[#30363d] overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#0d1117] border-b border-[#30363d]">
                                        <th className="text-left py-2 px-4 text-xs font-medium text-[#8b949e]">Bidder</th>
                                        <th className="text-right py-2 px-4 text-xs font-medium text-[#8b949e]">Amount</th>
                                        <th className="text-right py-2 px-4 text-xs font-medium text-[#8b949e]">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bidHistory.map((bid: any, index: number) => (
                                        <tr
                                            key={bid.id}
                                            className={`border-b border-[#30363d] ${index === 0 ? 'bg-[#238636]/10' : ''}`}
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
                                                <span className="font-mono font-semibold text-[#3fb950]">
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
