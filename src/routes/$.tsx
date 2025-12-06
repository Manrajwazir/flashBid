import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '../components/ui/Button'

export const Route = createFileRoute('/$')({
    component: NotFoundPage,
})

function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
                {/* 404 Illustration */}
                <div className="relative mb-8">
                    <div className="text-[12rem] font-black text-[#2d1f40] leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl animate-bounce">🔍</div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-3xl font-black text-white mb-4">
                    Page Not Found
                </h1>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    Oops! The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                {/* Suggestions */}
                <div className="bg-[#1a1025] rounded-lg p-6 border border-[#3d2a54] mb-8">
                    <p className="text-sm font-semibold text-gray-400 mb-4">
                        Here are some helpful links:
                    </p>
                    <div className="flex flex-col gap-2">
                        <Link
                            to="/"
                            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                        >
                            🏠 Browse Auctions
                        </Link>
                        <Link
                            to="/sell"
                            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                        >
                            💰 Sell an Item
                        </Link>
                        <Link
                            to="/dashboard"
                            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                        >
                            📊 Your Dashboard
                        </Link>
                    </div>
                </div>

                {/* CTA */}
                <Link to="/">
                    <Button className="px-8">
                        ← Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}
