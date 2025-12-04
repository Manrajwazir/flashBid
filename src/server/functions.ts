import { createServerFn } from '@tanstack/react-start'
import { prisma } from '../db'

export const getAuctions = createServerFn({ method: 'GET' }).handler(async () => {
  const auctions = await prisma.auction.findMany({
    where: { status: 'OPEN' },
    orderBy: { endsAt: 'asc' },
  })
  
  return auctions
})



export const placeBid = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const data = (ctx as any).data as { auctionId: string; amount: number }
    
    const bidder = await prisma.user.upsert({
      where: { email: 'demo@buyer.com' },
      update: {},
      create: { email: 'demo@buyer.com', name: 'Demo Bidder' }
    })

    try {
      await prisma.$transaction(async (tx) => {
        const auction = await tx.auction.findUnique({
          where: { id: data.auctionId }
        })

        if (!auction || auction.status !== 'OPEN') {
          throw new Error("Auction is closed")
        }

        if (data.amount <= auction.currentPrice) {
          throw new Error("Bid must be higher than current price")
        }

        // Create Bid
        await tx.bid.create({
          data: {
            amount: data.amount,
            auctionId: data.auctionId,
            bidderId: bidder.id
          }
        })

        // Update Auction
        await tx.auction.update({
          where: { id: data.auctionId },
          data: { currentPrice: data.amount }
        })
      })

      return { success: true }
    } catch (error: any) {
      console.error(error)
      return { success: false, error: error.message || "Bid failed" }
    }
  })