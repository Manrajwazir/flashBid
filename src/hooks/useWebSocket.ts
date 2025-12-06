import { useEffect, useState, useCallback } from 'react'
import { useWebSocket, BidUpdate, AuctionUpdate } from '../components/WebSocketProvider'

export function useAuctionUpdates() {
    const { status, lastMessage, subscribe, unsubscribe } = useWebSocket()
    const [latestUpdate, setLatestUpdate] = useState<BidUpdate | AuctionUpdate | null>(null)

    useEffect(() => {
        subscribe('*')
        return () => unsubscribe('*')
    }, [subscribe, unsubscribe])

    useEffect(() => {
        if (lastMessage) {
            if (
                lastMessage.type === 'BID_PLACED' ||
                lastMessage.type === 'AUCTION_UPDATED' ||
                lastMessage.type === 'AUCTION_CLOSED' ||
                lastMessage.type === 'AUCTION_CREATED'
            ) {
                setLatestUpdate(lastMessage as BidUpdate | AuctionUpdate)
            }
        }
    }, [lastMessage])

    return { status, latestUpdate }
}

export function useBidUpdates(auctionId: string) {
    const { status, lastMessage, subscribe, unsubscribe } = useWebSocket()
    const [bids, setBids] = useState<BidUpdate[]>([])
    const [currentPrice, setCurrentPrice] = useState<number | null>(null)

    useEffect(() => {
        subscribe(auctionId)
        return () => unsubscribe(auctionId)
    }, [auctionId, subscribe, unsubscribe])

    useEffect(() => {
        if (lastMessage?.type === 'BID_PLACED' && lastMessage.auctionId === auctionId) {
            const bidUpdate = lastMessage as BidUpdate
            setBids((prev) => [bidUpdate, ...prev])
            setCurrentPrice(bidUpdate.newPrice)
        }
    }, [lastMessage, auctionId])

    const clearBids = useCallback(() => {
        setBids([])
    }, [])

    return { status, bids, currentPrice, clearBids }
}

export function useOutbidNotifications(
    userId: string | null,
    onOutbid?: (auctionId: string, newPrice: number) => void
) {
    const { lastMessage } = useWebSocket()

    useEffect(() => {
        if (!userId || !lastMessage) return

        if (lastMessage.type === 'BID_PLACED') {
            const { auctionId, newPrice, bidderId } = lastMessage as BidUpdate

            if (bidderId !== userId) {
                onOutbid?.(auctionId, newPrice)
            }
        }
    }, [lastMessage, userId, onOutbid])
}

export function useRealTimeAuctions<T extends { id: string; currentPrice: number }>(
    initialAuctions: T[]
): T[] {
    const [auctions, setAuctions] = useState<T[]>(initialAuctions)
    const { latestUpdate } = useAuctionUpdates()

    useEffect(() => {
        setAuctions(initialAuctions)
    }, [initialAuctions])

    useEffect(() => {
        if (!latestUpdate) return

        if (latestUpdate.type === 'BID_PLACED') {
            const { auctionId, newPrice } = latestUpdate as BidUpdate
            setAuctions((prev) =>
                prev.map((auction) =>
                    auction.id === auctionId
                        ? { ...auction, currentPrice: newPrice }
                        : auction
                )
            )
        }

        if (latestUpdate.type === 'AUCTION_CLOSED') {
            const { auctionId } = latestUpdate as AuctionUpdate
            setAuctions((prev) => prev.filter((auction) => auction.id !== auctionId))
        }
    }, [latestUpdate])

    return auctions
}
