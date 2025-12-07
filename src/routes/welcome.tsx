import { createFileRoute, Link } from '@tanstack/react-router'
import { useSession } from '../lib/auth-client'
import { Button } from '../components/ui/Button'
import { ConnectionStatus } from '../components/ConnectionStatus'

export const Route = createFileRoute('/welcome')({
    component: LandingPage,
})

function LandingPage() {
    const { data: session } = useSession()

    return (
        <div className="min-h-screen bg-[#0d1117]">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#238636] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1f6feb] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#f78166] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
                    <div className="text-center">
                        {/* Hackathon Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-full mb-8">
                            <span className="text-xl">🏆</span>
                            <span className="text-sm font-medium text-[#8b949e]">Prisma Hackathon 2025</span>
                            <span className="px-2 py-0.5 bg-[#238636] text-white text-xs font-bold rounded-full">LIVE</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-5xl sm:text-7xl font-bold text-[#e6edf3] mb-6 tracking-tight">
                            Lightning-Fast
                            <span className="block bg-gradient-to-r from-[#3fb950] via-[#58a6ff] to-[#f78166] bg-clip-text text-transparent">
                                Real-Time Auctions
                            </span>
                        </h1>

                        <p className="text-xl text-[#8b949e] max-w-2xl mx-auto mb-10">
                            Experience the thrill of live bidding with AI-powered insights.
                            FlashBid delivers real-time auctions with an AI auctioneer that
                            brings the excitement of a live auction house to your screen.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link to="/">
                                <Button variant="green" className="text-lg px-8 py-4">
                                    ⚡ Start Bidding Now
                                </Button>
                            </Link>
                            <Link to="/sell">
                                <Button variant="secondary" className="text-lg px-8 py-4">
                                    💰 Sell an Item
                                </Button>
                            </Link>
                        </div>

                        {/* Live Status */}
                        <div className="flex items-center justify-center gap-3">
                            <ConnectionStatus />
                            <span className="text-sm text-[#8b949e]">•</span>
                            <span className="text-sm text-[#8b949e]">WebSocket-Powered</span>
                            <span className="text-sm text-[#8b949e]">•</span>
                            <span className="text-sm text-[#8b949e]">Instant Updates</span>
                        </div>
                    </div>

                    {/* Hero Image/Demo */}
                    <div className="mt-16 relative">
                        <div className="bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-3 bg-[#21262d] border-b border-[#30363d]">
                                <div className="w-3 h-3 rounded-full bg-[#f85149]" />
                                <div className="w-3 h-3 rounded-full bg-[#d29922]" />
                                <div className="w-3 h-3 rounded-full bg-[#3fb950]" />
                                <span className="ml-4 text-sm text-[#8b949e]">FlashBid — Live Auction</span>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { title: 'Vintage Watch', price: '$2,450', bids: 23, time: '2m 34s', emoji: '⌚' },
                                    { title: 'Gaming Console', price: '$890', bids: 15, time: '5m 12s', emoji: '🎮' },
                                    { title: 'Art Collection', price: '$12,500', bids: 47, time: '45s', hot: true, emoji: '🎨' },
                                ].map((item, i) => (
                                    <div key={i} className={`bg-[#0d1117] border rounded-md p-4 ${item.hot ? 'border-[#f85149] animate-pulse' : 'border-[#30363d]'}`}>
                                        <div className="aspect-video bg-[#21262d] rounded mb-3 flex items-center justify-center text-4xl">
                                            {item.emoji}
                                        </div>
                                        <h3 className="font-semibold text-[#e6edf3] mb-1">{item.title}</h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-mono font-bold text-[#3fb950]">{item.price}</span>
                                            <span className="text-xs text-[#8b949e]">{item.bids} bids</span>
                                        </div>
                                        <div className={`mt-2 text-xs font-mono ${item.hot ? 'text-[#f85149]' : 'text-[#8b949e]'}`}>
                                            ⏱ {item.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Features Section */}
            <section className="py-24 bg-[#161b22] border-y border-[#30363d]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 bg-[#58a6ff]/10 text-[#58a6ff] text-sm font-medium rounded-full mb-4">
                            AI-Powered
                        </span>
                        <h2 className="text-4xl font-bold text-[#e6edf3] mb-4">
                            Intelligent Auction Features
                        </h2>
                        <p className="text-[#8b949e] max-w-2xl mx-auto">
                            Our AI doesn't just assist—it transforms the auction experience with
                            real-time insights, smart pricing, and live commentary.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* AI Auctioneer */}
                        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 hover:border-[#8b949e] transition-colors">
                            <div className="w-14 h-14 bg-[#f78166]/10 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-3xl">🎙️</span>
                            </div>
                            <h3 className="text-xl font-semibold text-[#e6edf3] mb-2">AI Auctioneer</h3>
                            <p className="text-[#8b949e] text-sm mb-4">
                                Live voice commentary that reacts to bids in real-time.
                                Experience the thrill of a traditional auction house with our
                                text-to-speech AI announcer.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2 text-[#8b949e]">
                                    <span className="text-[#3fb950]">✓</span> Real-time bid announcements
                                </li>
                                <li className="flex items-center gap-2 text-[#8b949e]">
                                    <span className="text-[#3fb950]">✓</span> Countdown warnings
                                </li>
                                <li className="flex items-center gap-2 text-[#8b949e]">
                                    <span className="text-[#3fb950]">✓</span> Text-to-speech toggle
                                </li>
                            </ul>
                        </div>

                        {/* AI Bid Advisor */}
                        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 hover:border-[#8b949e] transition-colors">
                            <div className="w-14 h-14 bg-[#3fb950]/10 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-3xl">🤖</span>
                            </div>
                            <h3 className="text-xl font-semibold text-[#e6edf3] mb-2">AI Bid Advisor</h3>
                            <p className="text-[#8b949e] text-sm mb-4">
                                Get intelligent price predictions and optimal bid suggestions.
                                Our AI analyzes auction patterns to help you bid smart.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2 text-[#8b949e]">
                                    <span className="text-[#3fb950]">✓</span> Price prediction range
                                </li>
                                <li className="flex items-center gap-2 text-[#8b949e]">
                                    <span className="text-[#3fb950]">✓</span> Suggested winning bid
                                </li>
                                <li className="flex items-center gap-2 text-[#8b949e]">
                                    <span className="text-[#3fb950]">✓</span> Confidence scoring
                                </li>
                            </ul>
                        </div>

                        {/* AI Smart Listing */}
                        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6 hover:border-[#8b949e] transition-colors">
                            <div className="w-14 h-14 bg-[#58a6ff]/10 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-3xl">✨</span>
                            </div>
                            <h3 className="text-xl font-semibold text-[#e6edf3] mb-2">AI Smart Listing</h3>
                            <p className="text-[#8b949e] text-sm mb-4">
                                Upload an image and let AI generate the perfect listing.
                                Automatic title, description, and suggested starting price.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2 text-[#8b949e]">
                                    <span className="text-[#3fb950]">✓</span> Image analysis
                                </li>
                                <li className="flex items-center gap-2 text-[#8b949e]">
                                    <span className="text-[#3fb950]">✓</span> Auto-generated descriptions
                                </li>
                                <li className="flex items-center gap-2 text-[#8b949e]">
                                    <span className="text-[#3fb950]">✓</span> Smart price suggestions
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[#e6edf3] mb-4">
                            How It Works
                        </h2>
                        <p className="text-[#8b949e]">
                            Three simple steps to start winning auctions
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '1', title: 'Browse & Discover', description: 'Explore live auctions in real-time. Filter by price, search for items, and find exactly what you\'re looking for.', icon: '🔍' },
                            { step: '2', title: 'Get AI Insights', description: 'Use our AI Bid Advisor to get price predictions and optimal bid suggestions before placing your bid.', icon: '🧠' },
                            { step: '3', title: 'Bid & Win', description: 'Place your bid and watch the AI Auctioneer call the action. Outbid notifications keep you in the game.', icon: '🏆' },
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#30363d] to-transparent" />
                                )}
                                <div className="text-center">
                                    <div className="relative inline-block mb-6">
                                        <div className="w-16 h-16 bg-[#161b22] border border-[#30363d] rounded-full flex items-center justify-center text-3xl">
                                            {item.icon}
                                        </div>
                                        <span className="absolute -top-2 -right-2 w-7 h-7 bg-[#238636] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {item.step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-[#e6edf3] mb-2">{item.title}</h3>
                                    <p className="text-[#8b949e] text-sm">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Real-Time Features */}
            <section className="py-24 bg-[#161b22] border-y border-[#30363d]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="inline-block px-3 py-1 bg-[#3fb950]/10 text-[#3fb950] text-sm font-medium rounded-full mb-4">
                                Real-Time
                            </span>
                            <h2 className="text-4xl font-bold text-[#e6edf3] mb-6">
                                Instant Updates, Zero Delay
                            </h2>
                            <p className="text-[#8b949e] mb-8">
                                Built on WebSocket technology, FlashBid delivers instant bid updates,
                                live countdown timers, and real-time outbid notifications.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    { icon: '⚡', title: 'Instant Bid Updates', desc: 'See new bids the moment they happen' },
                                    { icon: '🔔', title: 'Outbid Notifications', desc: 'Get alerted when someone outbids you' },
                                    { icon: '⏱️', title: 'Live Countdowns', desc: 'Real-time countdown to auction end' },
                                    { icon: '📊', title: 'Live Bid History', desc: 'Watch the bidding action unfold' },
                                ].map((feat, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-[#0d1117] border border-[#30363d] rounded-lg flex items-center justify-center text-xl">
                                            {feat.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-[#e6edf3]">{feat.title}</h4>
                                            <p className="text-sm text-[#8b949e]">{feat.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-[#e6edf3]">Live Bid Activity</h4>
                                    <span className="flex items-center gap-2 text-xs text-[#3fb950]">
                                        <span className="w-2 h-2 bg-[#3fb950] rounded-full animate-pulse" />
                                        Connected
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { user: 'Alex M.', amount: '$2,500', time: 'Just now', isNew: true },
                                        { user: 'Sarah K.', amount: '$2,450', time: '5s ago', isNew: false },
                                        { user: 'John D.', amount: '$2,400', time: '12s ago', isNew: false },
                                        { user: 'Emily R.', amount: '$2,350', time: '28s ago', isNew: false },
                                    ].map((item, i) => (
                                        <div key={i} className={`flex items-center justify-between p-3 rounded-md ${item.isNew ? 'bg-[#238636]/10 border border-[#238636]/30' : 'bg-[#161b22]'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-[#21262d] rounded-full flex items-center justify-center text-sm text-[#e6edf3]">
                                                    {item.user.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="text-sm text-[#e6edf3]">{item.user}</span>
                                                    <span className="text-sm text-[#8b949e]"> bid </span>
                                                    <span className="text-sm font-semibold text-[#3fb950]">{item.amount}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-[#6e7681]">{item.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 bg-[#f78166]/10 text-[#f78166] text-sm font-medium rounded-full mb-4">
                            🏆 Prisma Hackathon 2025
                        </span>
                        <h2 className="text-4xl font-bold text-[#e6edf3] mb-4">
                            Built with Modern Tech
                        </h2>
                        <p className="text-[#8b949e] max-w-2xl mx-auto">
                            FlashBid leverages cutting-edge technologies for a blazing-fast experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { name: 'TanStack Start', desc: 'Full-stack React', emoji: '⚛️' },
                            { name: 'Prisma ORM', desc: 'Type-safe database', emoji: '💎' },
                            { name: 'Prisma DB', desc: 'Managed PostgreSQL', emoji: '🗄️' },
                            { name: 'Better-Auth', desc: 'Authentication', emoji: '🔐' },
                            { name: 'OpenAI', desc: 'GPT-4o AI', emoji: '🧠' },
                            { name: 'WebSocket', desc: 'Real-time updates', emoji: '⚡' },
                        ].map((tech, i) => (
                            <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center hover:border-[#8b949e] transition-colors">
                                <div className="text-2xl mb-2">{tech.emoji}</div>
                                <h4 className="font-semibold text-[#e6edf3] text-sm">{tech.name}</h4>
                                <p className="text-xs text-[#6e7681] mt-1">{tech.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Prisma Highlight */}
                    <div className="mt-12 bg-gradient-to-r from-[#5a67d8]/10 to-[#38bdf8]/10 border border-[#5a67d8]/30 rounded-lg p-8 text-center">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <span className="text-4xl">💎</span>
                            <span className="text-2xl font-bold text-[#e6edf3]">Powered by Prisma</span>
                        </div>
                        <p className="text-[#8b949e] max-w-2xl mx-auto">
                            Built during the Prisma Hackathon, FlashBid showcases the power of Prisma ORM
                            and Prisma DB for building type-safe, performant real-time applications.
                        </p>
                        <div className="flex justify-center gap-3 mt-6 flex-wrap">
                            <span className="px-3 py-1 bg-[#5a67d8]/20 text-[#a5b4fc] text-sm rounded-full">Prisma ORM</span>
                            <span className="px-3 py-1 bg-[#38bdf8]/20 text-[#7dd3fc] text-sm rounded-full">Prisma DB</span>
                            <span className="px-3 py-1 bg-[#f78166]/20 text-[#f78166] text-sm rounded-full">TanStack Start</span>
                            <span className="px-3 py-1 bg-[#10b981]/20 text-[#34d399] text-sm rounded-full">OpenAI</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-b from-[#0d1117] to-[#161b22]">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold text-[#e6edf3] mb-6">
                        Ready to Start Bidding?
                    </h2>
                    <p className="text-xl text-[#8b949e] mb-10">
                        Join the future of auctions. Real-time bidding, AI-powered insights,
                        and the thrill of the auction house—all in your browser.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {session?.user ? (
                            <>
                                <Link to="/">
                                    <Button variant="green" className="text-lg px-8 py-4">
                                        ⚡ Browse Live Auctions
                                    </Button>
                                </Link>
                                <Link to="/sell">
                                    <Button variant="secondary" className="text-lg px-8 py-4">
                                        💰 Create an Auction
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="green" className="text-lg px-8 py-4">
                                        Create Free Account
                                    </Button>
                                </Link>
                                <Link to="/">
                                    <Button variant="secondary" className="text-lg px-8 py-4">
                                        Browse as Guest
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-[#30363d]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⚡</span>
                            <span className="font-bold text-[#e6edf3]">FlashBid</span>
                        </div>
                        <p className="text-sm text-[#6e7681]">
                            © 2025 FlashBid. Built with ❤️ by Manraj Wazir.
                        </p>
                        <a
                            href="https://github.com/Manrajwazir/flashBid"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#8b949e] hover:text-[#e6edf3]"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>

            {/* Animation Styles */}
            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -30px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(30px, 10px) scale(1.05); }
                }
                .animate-blob {
                    animation: blob 15s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    )
}
