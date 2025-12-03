import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  })
  useEffect(() => setMounted(true), [])

  const linkBase = 'px-3 py-1 rounded hover:bg-gray-700 transition-colors'
  const isActive = (to: string) => mounted && pathname === to

  return (
    <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow">
      <Link to="/" className="text-lg font-semibold">
        Todo App
      </Link>
      <nav className="flex items-center gap-4">
        <Link to="/" className={`${linkBase} ${isActive('/') ? 'bg-gray-700' : ''}`}>
          Login
        </Link>
        <Link to="/todos" className={`${linkBase} ${isActive('/todos') ? 'bg-gray-700' : ''}`}>
          Todos
        </Link>
      </nav>
    </header>
  )
}
