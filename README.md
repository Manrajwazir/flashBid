# ⚡ FlashBid - Real-Time Auction Platform

A modern real-time auction platform with instant price updates, live bidding, and AI-powered features.

## 🌐 Live Demo

| Service       | URL                                                          |
| ------------- | ------------------------------------------------------------ |
| **Main App**  | [flashbid.onrender.com](https://flashbid.onrender.com)       |
| **WebSocket** | [flashbid-ws.onrender.com](https://flashbid-ws.onrender.com) |

---

## ✨ Key Features

- **Real-Time Bidding** — Prices update instantly via WebSocket
- **Live Countdown Timers** — See exactly when auctions end
- **Google OAuth** — Secure one-click login
- **Demo Mode** — Try instantly with auto-generated accounts
- **AI Bid Advisor** — Smart bidding recommendations
- **AI Auctioneer** — Live commentary on bidding activity
- **Dashboard** — Track bids, listings, wins, and sales
- **Responsive Design** — Works on desktop and mobile

---

## 🛠️ Tech Stack

| Category  | Technology                        |
| --------- | --------------------------------- |
| Frontend  | React 19, TanStack Router/Start   |
| Backend   | Vinxi (Nitro), Server Functions   |
| Database  | PostgreSQL (Supabase), Prisma ORM |
| Auth      | Better Auth + Google OAuth        |
| Real-Time | WebSocket (ws library)            |
| Hosting   | Render (2 services)               |

---

## 🚀 Quick Start

```bash
# Install
npm install
npx prisma generate

# Configure .env
DATABASE_URL="your-postgres-url"
BETTER_AUTH_SECRET="random-secret"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-secret"

# Run
npm run dev
```

---

## 📁 Project Structure

```
src/
├── components/     # UI components + WebSocketProvider
├── hooks/          # useWebSocket hooks
├── routes/         # Pages (auctions, dashboard, sell, etc.)
├── server/         # API functions + WebSocket server
└── lib/            # Auth config + utilities
```

---

## 🌍 Deployment (Render)

**Service 1: Main App**
- Build: `npm run build`
- Start: `npm start`

**Service 2: WebSocket**
- Build: `npm install && npx prisma generate`
- Start: `npm run start:ws`

---

## 📜 Scripts

| Command            | Description                   |
| ------------------ | ----------------------------- |
| `npm run dev`      | Development (app + WebSocket) |
| `npm run build`    | Production build              |
| `npm start`        | Run production server         |
| `npm run start:ws` | WebSocket server only         |

---

## 📝 License

MIT License

---

**Built with ⚡ for hackathon speed**
