import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '../components/ui/Button'

export const Route = createFileRoute('/$')({
    component: NotFoundPage,
})

function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#0d1117]">
            <div className="text-center max-w-md">
                {/* 404 Illustration */}
                <div className="relative mb-6">
                    <div className="text-[10rem] font-bold text-[#21262d] leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-5xl">🔍</div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-2xl font-semibold text-[#e6edf3] mb-3">
                    Page Not Found
                </h1>
                <p className="text-[#8b949e] text-sm mb-6">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Suggestions */}
                <div className="bg-[#161b22] rounded-md p-4 border border-[#30363d] mb-6">
                    <p className="text-xs text-[#6e7681] mb-3">
                        Helpful links:
                    </p>
                    <div className="flex flex-col gap-2">
                        <Link
                            to="/"
                            className="text-[#58a6ff] hover:underline text-sm"
                        >
                            🏠 Browse Auctions
                        </Link>
                        <Link
                            to="/sell"
                            className="text-[#58a6ff] hover:underline text-sm"
                        >
                            💰 Sell an Item
                        </Link>
                        <Link
                            to="/dashboard"
                            className="text-[#58a6ff] hover:underline text-sm"
                        >
                            📊 Your Dashboard
                        </Link>
                    </div>
                </div>

                {/* CTA */}
                <Link to="/">
                    <Button className="px-6">
                        ← Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}
