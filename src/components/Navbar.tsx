import { Link } from '@tanstack/react-router'
import { useSession, signOut } from '../lib/auth-client'
import { useState } from 'react'

export function Navbar() {
    const { data: session } = useSession()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleSignOut = async () => {
        await signOut()
        window.location.href = '/'
    }

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                            FlashBid
                        </span>
                        <span className="text-2xl group-hover:scale-110 transition-transform">⚡️</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-blue-600 font-semibold transition-colors"
                        >
                            Browse
                        </Link>

                        {session?.user ? (
                            <>
                                <a
                                    href="/sell"
                                    className="text-gray-700 hover:text-blue-600 font-semibold transition-colors"
                                >
                                    Sell
                                </a>
                                <a
                                    href="/dashboard"
                                    className="text-gray-700 hover:text-blue-600 font-semibold transition-colors"
                                >
                                    Dashboard
                                </a>

                                {/* User Menu */}
                                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                    <img
                                        src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'User')}&background=3B82F6&color=fff`}
                                        alt={session.user.name || 'User'}
                                        className="w-9 h-9 rounded-full ring-2 ring-blue-500"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">{session.user.name}</span>
                                        <button
                                            onClick={handleSignOut}
                                            className="text-xs text-gray-500 hover:text-red-600 transition-colors text-left"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <a
                                href="/login"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
                            >
                                Sign In
                            </a>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col gap-3">
                            <Link
                                to="/"
                                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Browse
                            </Link>

                            {session?.user ? (
                                <>
                                    <a
                                        href="/sell"
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sell
                                    </a>
                                    <a
                                        href="/dashboard"
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </a>
                                    <div className="px-4 py-2 border-t border-gray-200 mt-2">
                                        <div className="flex items-center gap-3 mb-3">
                                            <img
                                                src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'User')}&background=3B82F6&color=fff`}
                                                alt={session.user.name || 'User'}
                                                className="w-10 h-10 rounded-full ring-2 ring-blue-500"
                                            />
                                            <span className="font-bold text-gray-900">{session.user.name}</span>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <a
                                    href="/login"
                                    className="mx-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-center transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign In
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
