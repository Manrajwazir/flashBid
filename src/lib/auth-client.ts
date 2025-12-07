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

// Get current user ID (for passing to server functions)
export function getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null
    return null // Use useSession hook for reactive updates
}
