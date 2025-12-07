import { createServerFn } from '@tanstack/react-start'
import { prisma } from '../db'
import { createAuctionSchema } from '../lib/validations/auction-schema'

interface GetAuctionsParams {
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'endingSoon' | 'priceLow' | 'priceHigh'
  page?: number
  limit?: number
}

// Rate limiting: Track last bid time per user (in memory for simplicity)
const userLastBidTime = new Map<string, number>()
const RATE_LIMIT_MS = 2000 // 2 seconds between bids

// Calculate minimum bid increment (greater of $1 or 5% of current price)
function getMinBidIncrement(currentPrice: number): number {
  const fivePercent = currentPrice * 0.05
  return Math.max(1, Math.ceil(fivePercent * 100) / 100)
}

// Broadcast bid update to WebSocket server
async function broadcastBid(auctionId: string, newPrice: number, bidderId: string, bidderName?: string) {
  try {
    await fetch('http://localhost:3002/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'BID_PLACED',
        auctionId,
        newPrice,
        bidderId,
        bidderName,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (err) {
    // Don't fail the bid if broadcast fails
    console.error('Failed to broadcast bid:', err)
  }
}

export const getAuctions = createServerFn({ method: 'GET' })
  .handler(async (ctx) => {
    const params = (ctx as any).data as GetAuctionsParams | undefined

    // Calculate 12 hours ago for filtering ended auctions
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000)

    // Base filter: OPEN auctions OR auctions that ended within the last 12 hours
    const where: any = {
      OR: [
        { status: 'OPEN' },
        {
          status: 'CLOSED',
          endsAt: { gte: twelveHoursAgo }
        }
      ]
    }

    // Search filter
    if (params?.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: params.search, mode: 'insensitive' } },
            { description: { contains: params.search, mode: 'insensitive' } },
          ]
        }
      ]
    }

    // Price filters
    if (params?.minPrice !== undefined || params?.maxPrice !== undefined) {
      const priceFilter: any = {}
      if (params?.minPrice !== undefined) priceFilter.gte = params.minPrice
      if (params?.maxPrice !== undefined) priceFilter.lte = params.maxPrice

      if (where.AND) {
        where.AND.push({ currentPrice: priceFilter })
      } else {
        where.AND = [{ currentPrice: priceFilter }]
      }
    }

    // Pagination
    const page = params?.page || 1
    const limit = params?.limit || 100
    const skip = (page - 1) * limit

    // First, get all auctions matching the filter
    const allAuctions = await prisma.auction.findMany({
      where,
      include: {
        seller: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { bids: true },
        },
      },
    })

    // Helper function to check if auction is actually active (not ended)
    const isActiveAuction = (auction: any) => {
      const now = new Date()
      return auction.status === 'OPEN' && new Date(auction.endsAt) > now
    }

    // Sort: Active auctions first (by endsAt ascending), then ended auctions (by endsAt descending)
    const sortedAuctions = allAuctions.sort((a: any, b: any) => {
      const aIsActive = isActiveAuction(a)
      const bIsActive = isActiveAuction(b)

      // If one is active and the other is not, active comes first
      if (aIsActive && !bIsActive) return -1
      if (!aIsActive && bIsActive) return 1

      // Both are active: sort by endsAt ascending (ending soonest first)
      if (aIsActive && bIsActive) {
        return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()
      }

      // Both are ended: sort by endsAt descending (most recently ended first)
      return new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime()
    })

    // Apply custom sort if specified (only affects active auctions order within their group)
    if (params?.sortBy === 'priceLow') {
      sortedAuctions.sort((a: any, b: any) => {
        const aIsActive = isActiveAuction(a)
        const bIsActive = isActiveAuction(b)
        if (aIsActive !== bIsActive) return aIsActive ? -1 : 1
        if (aIsActive) return a.currentPrice - b.currentPrice
        return new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime()
      })
    } else if (params?.sortBy === 'priceHigh') {
      sortedAuctions.sort((a: any, b: any) => {
        const aIsActive = isActiveAuction(a)
        const bIsActive = isActiveAuction(b)
        if (aIsActive !== bIsActive) return aIsActive ? -1 : 1
        if (aIsActive) return b.currentPrice - a.currentPrice
        return new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime()
      })
    }

    // Apply pagination
    const paginatedAuctions = sortedAuctions.slice(skip, skip + limit)
    const total = sortedAuctions.length

    return { auctions: paginatedAuctions, total, page, limit, totalPages: Math.ceil(total / limit) }
  })

// Get a single auction by ID with full details
export const getAuctionById = createServerFn({ method: 'GET' })
  .handler(async (ctx) => {
    const data = (ctx as any).data as { auctionId: string }

    const auction = await prisma.auction.findUnique({
      where: { id: data.auctionId },
      include: {
        seller: {
          select: { id: true, name: true, email: true, image: true, createdAt: true },
        },
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            bidder: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        _count: {
          select: { bids: true },
        },
      },
    })

    if (!auction) {
      throw new Error('Auction not found')
    }

    return auction
  })

// Get bid history for an auction
export const getAuctionBids = createServerFn({ method: 'GET' })
  .handler(async (ctx) => {
    const data = (ctx as any).data as { auctionId: string; limit?: number }

    const bids = await prisma.bid.findMany({
      where: { auctionId: data.auctionId },
      orderBy: { createdAt: 'desc' },
      take: data.limit || 20,
      include: {
        bidder: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    return bids
  })

export const placeBid = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const data = (ctx as any).data as { auctionId: string; amount: number; userId?: string }

    // Get user ID from data (passed from client)
    const userId = data.userId
    if (!userId) {
      return { success: false, error: 'You must be logged in to place a bid' }
    }

    // Rate limiting check
    const lastBidTime = userLastBidTime.get(userId)
    if (lastBidTime && Date.now() - lastBidTime < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastBidTime)) / 1000)
      return { success: false, error: `Please wait ${waitTime} second(s) before placing another bid` }
    }

    const bidder = await prisma.user.findUnique({ where: { id: userId } })
    if (!bidder) {
      return { success: false, error: 'User not found' }
    }

    try {
      const result = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
        const auction = await tx.auction.findUnique({
          where: { id: data.auctionId }
        })

        if (!auction) {
          throw new Error('Auction not found')
        }

        if (auction.status !== 'OPEN') {
          throw new Error('This auction is closed')
        }

        // Prevent seller from bidding on their own auction
        if (auction.sellerId === userId) {
          throw new Error('You cannot bid on your own auction')
        }

        // Check if auction has expired
        if (new Date(auction.endsAt) < new Date()) {
          // Auto-close the auction
          await tx.auction.update({
            where: { id: data.auctionId },
            data: { status: 'CLOSED' }
          })
          throw new Error('This auction has ended')
        }

        // Calculate minimum bid
        const minIncrement = getMinBidIncrement(auction.currentPrice)
        const minBid = auction.currentPrice + minIncrement

        if (data.amount < minBid) {
          throw new Error(`Bid must be at least $${minBid.toFixed(2)} (minimum increment: $${minIncrement.toFixed(2)})`)
        }

        // Create Bid
        const bid = await tx.bid.create({
          data: {
            amount: data.amount,
            auctionId: data.auctionId,
            bidderId: bidder.id
          }
        })

        // Update Auction
        const updatedAuction = await tx.auction.update({
          where: { id: data.auctionId },
          data: { currentPrice: data.amount }
        })

        return { bid, auction: updatedAuction }
      })

      // Update rate limit timestamp
      userLastBidTime.set(userId, Date.now())

      // Broadcast bid update to WebSocket server for real-time updates
      await broadcastBid(data.auctionId, result.auction.currentPrice, bidder.id, bidder.name || undefined)

      return {
        success: true,
        newPrice: result.auction.currentPrice,
        bidId: result.bid.id
      }
    } catch (error: any) {
      console.error(error)
      return { success: false, error: error.message || 'Bid failed' }
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

    // Validate image URL if provided
    if (validated.imageUrl) {
      // Allow data: URLs for file uploads
      if (validated.imageUrl.startsWith('data:')) {
        // Validate it's an image data URL
        if (!validated.imageUrl.startsWith('data:image/')) {
          throw new Error('Invalid image data format')
        }
      } else {
        // Validate regular URLs
        try {
          const url = new URL(validated.imageUrl)
          if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('Image URL must use HTTP or HTTPS')
          }
        } catch {
          throw new Error('Invalid image URL format')
        }
      }
    }

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
    const bidsWithStatus = bids.map((bid: typeof bids[number]) => ({
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

// Close expired auctions with winner handling
export const closeExpiredAuctions = createServerFn({ method: 'POST' })
  .handler(async () => {
    // Find all expired auctions that are still open
    const expiredAuctions = await prisma.auction.findMany({
      where: {
        status: 'OPEN',
        endsAt: { lt: new Date() },
      },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          include: { bidder: true }
        }
      }
    })

    let closedCount = 0

    for (const auction of expiredAuctions) {
      const highestBid = auction.bids[0]

      await prisma.auction.update({
        where: { id: auction.id },
        data: {
          status: 'CLOSED',
          winnerId: highestBid?.bidderId || null,
        }
      })
      closedCount++
    }

    return { closedCount }
  })

// Get auctions won by a user
export const getWonAuctions = createServerFn({ method: 'GET' })
  .handler(async (ctx) => {
    const data = (ctx as any).data as { userId?: string } | undefined
    const userId = data?.userId

    if (!userId) {
      throw new Error('You must be logged in')
    }

    const wonAuctions = await prisma.auction.findMany({
      where: {
        winnerId: userId,
        status: 'CLOSED',
      },
      include: {
        seller: {
          select: { id: true, name: true, email: true, image: true }
        },
        _count: { select: { bids: true } }
      },
      orderBy: { endsAt: 'desc' },
    })

    return wonAuctions
  })

// Get auctions sold by a user (where they are the seller and auction is closed with a winner)
export const getSoldAuctions = createServerFn({ method: 'GET' })
  .handler(async (ctx) => {
    const data = (ctx as any).data as { userId?: string } | undefined
    const userId = data?.userId

    if (!userId) {
      throw new Error('You must be logged in')
    }

    const soldAuctions = await prisma.auction.findMany({
      where: {
        sellerId: userId,
        status: 'CLOSED',
        winnerId: { not: null },
      },
      include: {
        winner: {
          select: { id: true, name: true, email: true, image: true }
        },
        _count: { select: { bids: true } }
      },
      orderBy: { endsAt: 'desc' },
    })

    return soldAuctions
  })

// ======== AUTH FUNCTIONS ========

// Generate random string for unique demo users
function generateRandomId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Fun adjectives and nouns for random usernames
const adjectives = ['Swift', 'Bold', 'Clever', 'Lucky', 'Rapid', 'Smart', 'Quick', 'Sharp', 'Bright', 'Cool']
const nouns = ['Bidder', 'Trader', 'Hunter', 'Seeker', 'Finder', 'Dealer', 'Hawk', 'Fox', 'Wolf', 'Eagle']

function generateRandomName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 1000)
  return `${adj}${noun}${num}`
}

// Sign in with demo user - creates a UNIQUE user each time
export const signInDemo = createServerFn({ method: 'POST' })
  .handler(async () => {
    try {
      const uniqueId = generateRandomId()
      const randomName = generateRandomName()
      const email = `demo_${uniqueId}@flashbid.com`

      // Create a new unique demo user
      const demoUser = await prisma.user.create({
        data: {
          email,
          name: randomName,
          emailVerified: true,
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomName)}&background=${Math.floor(Math.random() * 16777215).toString(16)}&color=fff`,
        },
      })

      console.log(`🎭 New demo user created: ${randomName} (${email})`)
      return { success: true, user: demoUser }
    } catch (error: any) {
      console.error('Sign-in error:', error)
      return { success: false, error: error.message || 'Sign-in failed' }
    }
  })