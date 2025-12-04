import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'

import type { ReactNode } from 'react'
import '../styles.css'
import { Navbar } from '../components/Navbar'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'FlashBid ⚡️' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Navbar />
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        {/* 3. Use HeadContent instead of Meta */}
        <HeadContent />
      </head>
      <body>
        <div className="min-h-screen bg-gray-50 text-black">
          {children}
        </div>
        {/* 4. Use Scripts (now imported from router) */}
        <Scripts />
      </body>
    </html>
  )
}