import { createServerFn } from '@tanstack/react-start'
import { prisma } from '../db'
import { createAuctionSchema } from '../lib/validations/auction-schema'

interface GetAuctionsParams {
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'endingSoon' | 'priceLow' | 'priceHigh'
}

export const getAuctions = createServerFn({ method: 'GET' })
  .handler(async (ctx) => {
    const params = (ctx as any).data as GetAuctionsParams | undefined

    const where: any = { status: 'OPEN' }

    // Search filter
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    // Price filters
    if (params?.minPrice !== undefined || params?.maxPrice !== undefined) {
      where.currentPrice = {}
      if (params?.minPrice !== undefined) where.currentPrice.gte = params.minPrice
      if (params?.maxPrice !== undefined) where.currentPrice.lte = params.maxPrice
    }

    // Determine sort order
    let orderBy: any = { endsAt: 'asc' } // default
    if (params?.sortBy === 'priceLow') orderBy = { currentPrice: 'asc' }
    else if (params?.sortBy === 'priceHigh') orderBy = { currentPrice: 'desc' }
    else if (params?.sortBy === 'endingSoon') orderBy = { endsAt: 'asc' }

    const auctions = await prisma.auction.findMany({
      where,
      orderBy,
    })

    return auctions
  })

export const placeBid = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const data = (ctx as any).data as { auctionId: string; amount: number; userId?: string }

    // Get user ID from data (passed from client)
    const userId = data.userId
    if (!userId) {
      return { success: false, error: 'You must be logged in to place a bid' }
    }

    const bidder = await prisma.user.findUnique({ where: { id: userId } })
    if (!bidder) {
      return { success: false, error: 'User not found' }
    }

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

// Create a new auction
export const createAuction = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const data = (ctx as any).data as any

    // Get user ID from data (passed from client)
    const userId = data.userId
    if (!userId) {
      throw new Error('You must be logged in to create an auction')
    }

    // Validate with Zod
    const validated = createAuctionSchema.parse(data)

    const auction = await prisma.auction.create({
      data: {
        title: validated.title,
        description: validated.description,
        imageUrl: validated.imageUrl || null,
        startPrice: validated.startPrice,
        currentPrice: validated.startPrice,
        endsAt: validated.endsAt,
        sellerId: userId,
      },
    })

    return auction
  })

// Get user's bids with winning/losing status
export const getUserBids = createServerFn({ method: 'GET' })
  .handler(async (ctx) => {
    const data = (ctx as any).data as { userId?: string } | undefined
    const userId = data?.userId

    if (!userId) {
      throw new Error('You must be logged in')
    }

    const bids = await prisma.bid.findMany({
      where: { bidderId: userId },
      include: {
        auction: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Add winning/losing status
    const bidsWithStatus = bids.map(bid => ({
      ...bid,
      isWinning: bid.amount === bid.auction.currentPrice,
    }))

    return bidsWithStatus
  })

// Get user's auctions
export const getUserAuctions = createServerFn({ method: 'GET' })
  .handler(async (ctx) => {
    const data = (ctx as any).data as { userId?: string } | undefined
    const userId = data?.userId

    if (!userId) {
      throw new Error('You must be logged in')
    }

    const auctions = await prisma.auction.findMany({
      where: { sellerId: userId },
      include: {
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return auctions
  })

// Delete an auction (only if no bids)
export const deleteAuction = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const data = (ctx as any).data as { auctionId: string; userId?: string }
    const userId = data.userId

    if (!userId) {
      throw new Error('You must be logged in')
    }

    const { auctionId } = data

    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: { _count: { select: { bids: true } } },
    })

    if (!auction) {
      throw new Error('Auction not found')
    }

    if (auction.sellerId !== userId) {
      throw new Error('You can only delete your own auctions')
    }

    if (auction._count.bids > 0) {
      throw new Error('Cannot delete an auction with existing bids')
    }

    await prisma.auction.delete({
      where: { id: auctionId },
    })

    return { success: true }
  })

// ======== AUTH FUNCTIONS ========

// Sign in with demo user - returns user data for client to store
export const signInDemo = createServerFn({ method: 'POST' })
  .handler(async () => {
    try {
      // Create a demo user
      const demoUser = await prisma.user.upsert({
        where: { email: 'demo@flashbid.com' },
        update: {},
        create: {
          email: 'demo@flashbid.com',
          name: 'Demo User',
          emailVerified: true,
          image: 'https://ui-avatars.com/api/?name=Demo+User&background=3B82F6&color=fff',
        },
      })

      return { success: true, user: demoUser }
    } catch (error: any) {
      console.error('Sign-in error:', error)
      return { success: false, error: error.message || 'Sign-in failed' }
    }
  })