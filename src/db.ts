import { PrismaClient } from '@prisma/client'

import { PrismaPg } from '@prisma/adapter-pg'

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please create a .env file with DATABASE_URL.'
  )
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
