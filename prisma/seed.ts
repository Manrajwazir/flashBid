import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

// Load environment variables so we can find the DB
dotenv.config()

const connectionString = process.env.DATABASE_URL!

// Setup the connection (Same as your db.ts)
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create a Seller
  const seller = await prisma.user.create({
    data: {
      email: 'seller@flashbid.com',
      name: 'Retro Vault',
      image: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
    },
  })

  // 2. Create the Auctions
  await prisma.auction.createMany({
    data: [
      {
        title: 'Nintendo GameBoy Color',
        description: 'Mint condition, atomic purple. Comes with Tetris.',
        startPrice: 45.00,
        currentPrice: 45.00,
        imageUrl: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?auto=format&fit=crop&w=800&q=80',
        sellerId: seller.id,
        endsAt: new Date(Date.now() + 86400000), // Ends in 24 hours
        status: 'OPEN'
      },
      {
        title: 'Sony WH-1000XM4',
        description: 'Noise cancelling headphones. Barely used.',
        startPrice: 150.00,
        currentPrice: 150.00,
        imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
        sellerId: seller.id,
        endsAt: new Date(Date.now() + 86400000),
        status: 'OPEN'
      },
      {
        title: 'IBM Model M Keyboard',
        description: 'Vintage mechanical keyboard. Clicky.',
        startPrice: 80.00,
        currentPrice: 80.00,
        imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
        sellerId: seller.id,
        endsAt: new Date(Date.now() + 86400000),
        status: 'OPEN'
      }
    ]
  })

  console.log('✅ Database seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })