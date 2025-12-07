import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'

import type { ReactNode } from 'react'
import '../styles.css'
import { Navbar } from '../components/Navbar'
import { ToastProvider } from '../components/ToastProvider'
import { WebSocketProvider } from '../components/WebSocketProvider'
import { ErrorBoundary } from '../components/ErrorBoundary'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'FlashBid ⚡️ - Real-Time Auctions' },
      { name: 'description', content: 'FlashBid is a real-time auction platform where you can buy and sell items in lightning-fast bidding wars.' },
      { name: 'keywords', content: 'auction, bidding, buy, sell, real-time, flash sale' },
      { property: 'og:title', content: 'FlashBid ⚡️ - Real-Time Auctions' },
      { property: 'og:description', content: 'Buy and sell in lightning-fast bidding wars.' },
      { property: 'og:type', content: 'website' },
      { name: 'theme-color', content: '#0d1117' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <ErrorBoundary>
        <WebSocketProvider>
          <ToastProvider>
            <Navbar />
            <Outlet />
          </ToastProvider>
        </WebSocketProvider>
      </ErrorBoundary>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-[#0d1117] text-[#e6edf3]">
        <div className="min-h-screen">
          {children}
        </div>
        <Scripts />
      </body>
    </html>
  )
}