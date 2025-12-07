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
        <nav className="sticky top-0 z-50 bg-[#161b22] border-b border-[#30363d]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-[#e6edf3] hover:text-[#58a6ff] transition-colors">
                            FlashBid
                        </span>
                        <span className="text-lg">⚡</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/"
                            className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            to="/auctions"
                            className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium transition-colors"
                        >
                            Auctions
                        </Link>

                        {session?.user ? (
                            <>
                                <a
                                    href="/sell"
                                    className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium transition-colors"
                                >
                                    Sell
                                </a>
                                <a
                                    href="/dashboard"
                                    className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium transition-colors"
                                >
                                    Dashboard
                                </a>

                                {/* User Menu */}
                                <div className="flex items-center gap-2 pl-4 border-l border-[#30363d]">
                                    <img
                                        src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'User')}&background=30363d&color=e6edf3`}
                                        alt={session.user.name || 'User'}
                                        className="w-7 h-7 rounded-full"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-[#e6edf3]">{session.user.name}</span>
                                        <button
                                            onClick={handleSignOut}
                                            className="text-xs text-[#8b949e] hover:text-[#f85149] transition-colors text-left"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <a
                                href="/login"
                                className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md text-sm font-medium transition-colors"
                            >
                                Sign in
                            </a>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-1.5 rounded-md hover:bg-[#21262d] text-[#8b949e]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="md:hidden py-3 border-t border-[#30363d]">
                        <div className="flex flex-col gap-1">
                            <Link
                                to="/"
                                className="px-3 py-2 text-[#8b949e] hover:bg-[#21262d] rounded-md text-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Browse
                            </Link>

                            {session?.user ? (
                                <>
                                    <a
                                        href="/sell"
                                        className="px-3 py-2 text-[#8b949e] hover:bg-[#21262d] rounded-md text-sm"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sell
                                    </a>
                                    <a
                                        href="/dashboard"
                                        className="px-3 py-2 text-[#8b949e] hover:bg-[#21262d] rounded-md text-sm"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </a>
                                    <div className="px-3 py-2 border-t border-[#30363d] mt-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <img
                                                src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'User')}&background=30363d&color=e6edf3`}
                                                alt={session.user.name || 'User'}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <span className="text-sm text-[#e6edf3]">{session.user.name}</span>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full px-3 py-1.5 bg-[#f85149]/10 hover:bg-[#f85149]/20 text-[#f85149] rounded-md text-sm transition-colors"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <a
                                    href="/login"
                                    className="mx-3 px-3 py-1.5 bg-[#238636] text-white rounded-md text-sm text-center transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign in
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
