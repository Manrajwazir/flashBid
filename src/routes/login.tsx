import { createFileRoute } from '@tanstack/react-router'
import { signIn, useSession } from '../lib/auth-client'
import { Button } from '../components/ui/Button'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/login')({
    component: LoginPage,
})

function LoginPage() {
    const { data: session, isPending } = useSession()
    const [isLoading, setIsLoading] = useState(false)

    // Redirect if already logged in
    useEffect(() => {
        if (session?.user && !isPending) {
            const redirect = new URLSearchParams(window.location.search).get('redirect') || '/'
            window.location.href = redirect
        }
    }, [session, isPending])

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            const result = await signIn('google')
            if (result.success) {
                window.location.href = '/'
            } else {
                alert('Login failed. Please try again.')
            }
        } catch (error) {
            console.error('Sign in error:', error)
            alert('Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
            <div className="max-w-md w-full">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <h1 className="text-5xl font-black text-gray-900">FlashBid</h1>
                        <span className="text-5xl">⚡️</span>
                    </div>
                    <p className="text-gray-600 text-lg">Sign in to start bidding and selling</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
                    <div className="space-y-4">
                        {/* Google Login - Now uses demo login */}
                        <Button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            isLoading={isLoading}
                            variant="primary"
                            className="w-full flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Demo Login (Click to Enter)
                        </Button>

                        <p className="text-xs text-center text-gray-500">
                            This is a demo - clicking will log you in instantly!
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-gray-600 hover:text-gray-900 font-semibold transition-colors"
                    >
                        ← Back to Browse
                    </button>
                </div>
            </div>
        </div>
    )
}
