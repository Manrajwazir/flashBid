import * as React from 'react'
import { signInDemo as serverSignIn } from '../server/functions'

const SESSION_KEY = 'flashbid_session'

// Get stored session from localStorage
function getStoredSession() {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
        try {
            return JSON.parse(stored)
        } catch {
            return null
        }
    }
    return null
}

// Store session in localStorage
function storeSession(session: any) {
    if (typeof window === 'undefined') return
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

// Clear session from localStorage
function clearSession() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(SESSION_KEY)
}

// Sign in - calls server function and stores result
export async function signIn(_provider: string) {
    const result = await serverSignIn()
    if (result.success && result.user) {
        storeSession({ user: result.user })
    }
    return result
}

// Sign out - clears localStorage
export async function signOut() {
    clearSession()
    return { success: true }
}

// Get current user ID (for passing to server functions)
export function getCurrentUserId(): string | null {
    const session = getStoredSession()
    return session?.user?.id || null
}

// Use session hook
export function useSession() {
    const [session, setSession] = React.useState<any>(null)
    const [isPending, setIsPending] = React.useState(true)

    React.useEffect(() => {
        const stored = getStoredSession()
        setSession(stored)
        setIsPending(false)

        // Listen for storage changes (for multi-tab support)
        const handleStorage = () => {
            setSession(getStoredSession())
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    return { data: session, isPending }
}
