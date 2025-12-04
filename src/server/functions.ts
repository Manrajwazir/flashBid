import { createServerFn } from '@tanstack/react-start'
import { prisma } from '../db'

export const getAuctions = createServerFn({ method: 'GET' }).handler(async () => {
  const auctions = await prisma.auction.findMany({
    where: { status: 'OPEN' },
    orderBy: { endsAt: 'asc' },
  })
  
  return auctions
})