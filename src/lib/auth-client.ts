import { createAuthClient } from 'better-auth/react'

// Create the better-auth client
const authClient = createAuthClient({
    baseURL: typeof window !== 'undefined' ? window.location.origin : '',
})

// Export signIn with social provider support
export const signIn = authClient.signIn

// Export signOut
export const signOut = authClient.signOut

// Export useSession hook
export const useSession = authClient.useSession

// Store user ID in sessionStorage for non-hook access
let cachedUserId: string | null = null

// Set user ID (call this when session changes)
export function setCurrentUserId(userId: string | null) {
    cachedUserId = userId
    if (typeof window !== 'undefined') {
        if (userId) {
            sessionStorage.setItem('currentUserId', userId)
        } else {
            sessionStorage.removeItem('currentUserId')
        }
    }
}

// Get current user ID (for passing to server functions)
export function getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null
    // Try cache first, then sessionStorage
    if (cachedUserId) return cachedUserId
    return sessionStorage.getItem('currentUserId')
}
