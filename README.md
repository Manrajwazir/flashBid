# ⚡ FlashBid - Real-Time Auction Platform

A modern, feature-rich real-time auction platform built for speed, reliability, and an exceptional user experience. Watch prices update instantly, place competitive bids, and manage your auction portfolio — all wrapped in a sleek, dark-themed interface inspired by GitHub's design language.

---

## 🌐 Live Demo

### **🔗 [https://flashbid.onrender.com](https://flashbid.onrender.com)**

| Service              | URL                                                          |
| -------------------- | ------------------------------------------------------------ |
| **Main Application** | [flashbid.onrender.com](https://flashbid.onrender.com)       |
| **WebSocket Server** | [flashbid-ws.onrender.com](https://flashbid-ws.onrender.com) |

> ⚠️ **Free Tier Notice:** Hosted on Render's free tier — the app may take ~30-60 seconds to wake up on first visit after inactivity.

---

## ✨ Features

### 🔴 Real-Time Bidding Engine
The heart of FlashBid is its **WebSocket-powered real-time engine**:

- **Instant Price Updates** — When someone places a bid, every connected user sees the new price immediately (typically <100ms latency)
- **Live Bid Notifications** — Get notified instantly when you're outbid on an auction you're watching
- **Connection Status Indicator** — Visual indicator shows your real-time connection status (🟢 Connected, 🟡 Reconnecting, 🔴 Disconnected)
- **Automatic Reconnection** — If your connection drops, the client automatically reconnects with exponential backoff (1s → 2s → 4s → 8s → 16s → 30s)
- **Subscription-Based Updates** — Clients only receive updates for auctions they're actively viewing, reducing bandwidth

### 🏷️ Auction Management

#### For Buyers:
- **Browse & Search** — Filter auctions by title, description, and price range
- **Smart Sorting** — Sort by "Ending Soon", "Price: Low to High", or "Price: High to Low"
- **Active vs. Ended** — Active auctions always appear first; ended auctions show for 12 hours for reference
- **Quick Bid Modal** — Place bids without leaving the page via a sleek modal interface
- **Bid History** — View complete bid history on any auction with bidder names and timestamps

#### For Sellers:
- **Easy Listing Creation** — Create auctions with title, description, starting price, duration, and images
- **Image Upload** — Support for both URL-based images and direct file uploads (base64 encoded)
- **Flexible Duration** — Set auctions to end in hours, days, or at a specific date/time
- **Listing Management** — View, track, and delete your listings (deletion only allowed if no bids placed)

### 📊 Comprehensive Dashboard

The user dashboard provides a complete overview of your auction activity:

| Tab               | Description                                                                           |
| ----------------- | ------------------------------------------------------------------------------------- |
| **My Bids**       | All auctions you've bid on, with real-time status: 🏆 WON, ✗ LOST, ✓ WINNING, ✗ OUTBID |
| **My Listings**   | Auctions you've created, with status: 🟢 ACTIVE, 💰 SOLD, ⏰ EXPIRED                     |
| **Won Auctions**  | Items you've won, with seller contact information for pickup/payment                  |
| **Sold Auctions** | Your successfully sold items, with winner details                                     |

### 🤖 AI-Powered Features

#### AI Bid Advisor
An intelligent assistant that analyzes auction data and provides bidding recommendations:
- Evaluates current price vs. starting price
- Considers time remaining and bidding activity
- Suggests optimal bid amounts
- Warns about potentially overpriced items

#### AI Auctioneer
A fun, dynamic commentator that reacts to live bidding:
- Announces new bids in real-time
- Builds excitement as auctions near their end
- Celebrates winners when auctions close
- Provides color commentary based on bidding patterns

### ⏱️ Smart Countdown Timers

- **Visual Countdown** — Days, hours, minutes, seconds display
- **Color-Coded Urgency** — Timer turns red when <1 hour remains
- **Compact Mode** — Smaller timers for list views
- **Auto-Expire Handling** — Auctions automatically close when time runs out

### 🔐 Authentication System

- **Google OAuth 2.0** — Secure, one-click login via Google
- **Demo Mode** — Instant access with auto-generated demo accounts (unique per session)
- **Session Management** — Persistent sessions with secure cookie handling
- **Protected Routes** — Dashboard, Sell, and bidding require authentication

### 📱 Responsive Design

- **Mobile-First** — Optimized for phones, tablets, and desktops
- **Collapsible Navigation** — Hamburger menu on mobile with full navigation
- **Touch-Friendly** — Large tap targets and swipe-friendly interfaces
- **Adaptive Layouts** — Grid layouts adjust from 1 to 3 columns based on screen size

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React UI  │  │  TanStack   │  │  WebSocket Connection   │  │
│  │  Components │  │   Router    │  │  (Real-Time Updates)    │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│      MAIN APP SERVER        │    │    WEBSOCKET SERVER         │
│  (Render Web Service #1)    │    │  (Render Web Service #2)    │
│  ┌───────────────────────┐  │    │  ┌───────────────────────┐  │
│  │  Vinxi/Nitro Server   │  │    │  │   ws + HTTP Server    │  │
│  │  - API Routes         │──┼────┼─▶│   - Client Connections│  │
│  │  - Server Functions   │  │    │  │   - Broadcast Handler │  │
│  │  - SSR Rendering      │  │    │  │   - Heartbeat/Ping    │  │
│  └───────────┬───────────┘  │    │  └───────────────────────┘  │
└──────────────┼──────────────┘    └─────────────────────────────┘
               │
               ▼
┌─────────────────────────────┐
│    POSTGRESQL DATABASE      │
│        (Supabase)           │
│  ┌───────────────────────┐  │
│  │  - Users              │  │
│  │  - Auctions           │  │
│  │  - Bids               │  │
│  │  - Sessions           │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Real-Time Data Flow

```
1. User A places a bid
       │
       ▼
2. Main App Server validates bid
   - Check user authentication
   - Verify auction is still open
   - Validate bid amount (minimum increment)
   - Check rate limiting (2s cooldown)
       │
       ▼
3. Database transaction
   - Create Bid record
   - Update Auction.currentPrice
       │
       ▼
4. POST to WebSocket Server /broadcast
   {type: "BID_PLACED", auctionId, newPrice, bidderId}
       │
       ▼
5. WebSocket Server broadcasts to subscribed clients
       │
       ▼
6. All connected clients receive update
   - UI updates instantly
   - Toast notifications for outbid users
```

---

## 🛠️ Technology Deep Dive

### Frontend Stack

#### React 19
- Latest React with improved performance
- Concurrent rendering for smoother UX
- Automatic batching of state updates

#### TanStack Router
- **File-based routing** — Routes defined by file structure (`routes/auction.$auctionId.tsx`)
- **Type-safe navigation** — Full TypeScript support for route params
- **Built-in data loading** — `loader` functions fetch data before render
- **Pending states** — `pendingComponent` shows while data loads
- **Error boundaries** — `errorComponent` handles route-level errors

#### TanStack Start (Vinxi)
- **Full-stack React framework** — SSR, API routes, and client code in one
- **Server Functions** — `createServerFn` for type-safe RPC-style API calls
- **Nitro-powered** — Production-ready server with edge compatibility
- **Vite-based** — Lightning-fast HMR in development

#### State Management
- **React Context** — WebSocket connection shared via context
- **useState/useRef** — Local component state for UI
- **Server State** — Data fetched via loaders, mutations via server functions

### Backend Stack

#### Server Functions
Instead of traditional REST endpoints, FlashBid uses **TanStack Server Functions**:

```typescript
export const placeBid = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    // Full server-side logic
    // Database access, validation, etc.
  })
```

Benefits:
- Type-safe from client to server
- No manual fetch/axios calls
- Automatic serialization
- Works with SSR

#### Prisma ORM
- **Type-safe queries** — Full TypeScript inference from schema
- **Migrations** — `prisma db push` for schema sync
- **Relations** — Easy eager loading with `include`
- **Transactions** — `$transaction` for atomic operations

#### WebSocket Server (`ws` library)
Custom WebSocket server with:
- **Authentication** — Users can authenticate their connection
- **Subscriptions** — Subscribe to specific auction IDs
- **Broadcast API** — HTTP endpoint for triggering broadcasts
- **Heartbeat** — Ping/pong for connection health monitoring

### Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  auctions      Auction[] @relation("SellerAuctions")
  bids          Bid[]
  wonAuctions   Auction[] @relation("WonAuctions")
  sessions      Session[]
  accounts      Account[]
}

model Auction {
  id           String   @id @default(cuid())
  title        String
  description  String
  imageUrl     String?
  startPrice   Float
  currentPrice Float
  status       String   @default("OPEN")  // OPEN, CLOSED
  endsAt       DateTime
  createdAt    DateTime @default(now())
  
  seller       User     @relation("SellerAuctions", fields: [sellerId])
  sellerId     String
  winner       User?    @relation("WonAuctions", fields: [winnerId])
  winnerId     String?
  bids         Bid[]
}

model Bid {
  id        String   @id @default(cuid())
  amount    Float
  createdAt DateTime @default(now())
  
  auction   Auction  @relation(fields: [auctionId])
  auctionId String
  bidder    User     @relation(fields: [bidderId])
  bidderId  String
}
```

### Authentication (Better Auth)

Better Auth provides:
- **OAuth Providers** — Google, GitHub, etc.
- **Session Management** — Secure, httpOnly cookies
- **CSRF Protection** — Built-in token validation
- **Database Sessions** — Sessions stored in PostgreSQL

---

## 🔒 Security Features

| Feature              | Implementation                                                                |
| -------------------- | ----------------------------------------------------------------------------- |
| **Input Validation** | Zod schemas validate all user input                                           |
| **SQL Injection**    | Prisma parameterized queries                                                  |
| **XSS Protection**   | React's automatic escaping                                                    |
| **CSRF**             | Better Auth token validation                                                  |
| **Rate Limiting**    | 2-second cooldown between bids                                                |
| **Authorization**    | Server-side checks (can't bid on own auction, can't delete auction with bids) |
| **Secure Cookies**   | httpOnly, Secure, SameSite flags                                              |

---

## 📁 Project Structure

```
flashBid/
├── prisma/
│   └── schema.prisma              # Database schema definition
├── scripts/
│   └── start-ws.ts                # WebSocket server entry point
├── server/
│   └── api/auth/[...].ts          # Better Auth API routes
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx         # Styled button component
│   │   │   ├── Badge.tsx          # Status badges
│   │   │   ├── CountdownTimer.tsx # Live auction countdown
│   │   │   ├── Pagination.tsx     # Page navigation
│   │   │   └── Skeleton.tsx       # Loading skeletons
│   │   ├── Navbar.tsx             # Site navigation
│   │   ├── BidModal.tsx           # Bid placement dialog
│   │   ├── ToastProvider.tsx      # Notification system
│   │   ├── WebSocketProvider.tsx  # Real-time connection context
│   │   ├── ConnectionStatus.tsx   # WS status indicator
│   │   ├── AIBidAdvisor.tsx       # AI bidding recommendations
│   │   └── AIAuctioneer.tsx       # AI live commentary
│   ├── hooks/
│   │   └── useWebSocket.ts        # Custom hooks for real-time features
│   ├── lib/
│   │   ├── auth.ts                # Better Auth server config
│   │   ├── auth-client.ts         # Auth client hooks
│   │   ├── utils.ts               # Formatting utilities
│   │   └── validations/
│   │       └── auction-schema.ts  # Zod validation schemas
│   ├── routes/
│   │   ├── __root.tsx             # Root layout with providers
│   │   ├── index.tsx              # Landing/About page
│   │   ├── auctions.tsx           # Auction listings grid
│   │   ├── auction.$auctionId.tsx # Single auction detail
│   │   ├── dashboard.tsx          # User dashboard (4 tabs)
│   │   ├── sell.tsx               # Create new auction
│   │   ├── login.tsx              # Authentication page
│   │   └── $.tsx                  # 404 catch-all
│   ├── server/
│   │   ├── functions.ts           # All server-side API logic
│   │   └── websocket-server.ts    # WebSocket + broadcast server
│   ├── db.ts                      # Prisma client singleton
│   └── styles.css                 # Global styles
├── .env                           # Environment variables (not in git)
├── app.config.ts                  # TanStack Start config
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript config
└── package.json                   # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (LTS recommended)
- **PostgreSQL** database (local or Supabase)
- **Google Cloud Console** project with OAuth credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/flashBid.git
cd flashBid

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Database (Supabase example)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Authentication
BETTER_AUTH_SECRET="generate-a-random-32-char-string"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Environment
NODE_ENV="development"
```

### Database Setup

```bash
# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Running Locally

```bash
# Start both servers (app + WebSocket)
npm run dev
```

This runs:
- **Main app**: http://localhost:3000
- **WebSocket**: ws://localhost:3001

---

## 🌍 Production Deployment (Render)

FlashBid requires **two separate Render Web Services**:

### Service 1: Main Application

| Setting           | Value                |
| ----------------- | -------------------- |
| **Name**          | `flashbid`           |
| **Repository**    | Your GitHub repo     |
| **Branch**        | `main`               |
| **Build Command** | `npm run build`      |
| **Start Command** | `npm start`          |
| **Environment**   | All `.env` variables |

### Service 2: WebSocket Server

| Setting           | Value                                 |
| ----------------- | ------------------------------------- |
| **Name**          | `flashbid-ws`                         |
| **Repository**    | Same repo                             |
| **Branch**        | `main`                                |
| **Build Command** | `npm install && npx prisma generate`  |
| **Start Command** | `npm run start:ws`                    |
| **Environment**   | `DATABASE_URL`, `NODE_ENV=production` |

### Post-Deployment Checklist

1. ✅ Update `BETTER_AUTH_URL` to `https://flashbid.onrender.com`
2. ✅ Add `https://flashbid.onrender.com/api/auth/callback/google` to Google OAuth redirect URIs
3. ✅ Verify WebSocket connection works (check browser console for "🔌 WebSocket connected")

---

## 📜 Available Scripts

| Script             | Description                                        |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Development mode (app + WebSocket with hot reload) |
| `npm run build`    | Build production bundle                            |
| `npm start`        | Run production server                              |
| `npm run start:ws` | Run WebSocket server only                          |
| `npm run serve`    | Alias for `npm start`                              |

---

## 🧪 Testing the App

### Manual Testing Checklist

1. **Authentication**
   - [ ] Google login works
   - [ ] Demo login creates unique user
   - [ ] Sign out clears session

2. **Auction Browsing**
   - [ ] Auctions load on /auctions
   - [ ] Search filters work
   - [ ] Sorting works
   - [ ] Pagination works

3. **Bidding**
   - [ ] Can place bid on active auction
   - [ ] Cannot bid on own auction
   - [ ] Bid validation (minimum increment)
   - [ ] Rate limiting (2s cooldown)

4. **Real-Time**
   - [ ] Bids update without refresh
   - [ ] Multiple tabs stay in sync
   - [ ] Outbid notifications appear

5. **Dashboard**
   - [ ] My Bids shows correct status
   - [ ] My Listings shows correct status
   - [ ] Won/Sold tabs populate after auction ends

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** — feel free to use it for learning, hackathons, or as a foundation for your own auction platform.

---

## 🙏 Acknowledgments

- **TanStack** — For the incredible router and full-stack framework
- **Prisma** — For making database work enjoyable
- **Better Auth** — For simple, secure authentication
- **Render** — For easy deployment with WebSocket support
- **Supabase** — For managed PostgreSQL hosting

---

<div align="center">

**Built with ⚡ for speed and 💜 for great UX**

*Happy Bidding!*

</div>
