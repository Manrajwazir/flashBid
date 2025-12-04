import { defineEventHandler, setCookie } from 'h3'
import { prisma } from '../../../src/db'

export default defineEventHandler(async (event) => {
    try {
        // Create a demo user
        const demoUser = await prisma.user.upsert({
            where: { email: 'demo@flashbid.com' },
            update: {},
            create: {
                email: 'demo@flashbid.com',
                name: 'Demo User',
                emailVerified: true,
                image: 'https://ui-avatars.com/api/?name=Demo+User&background=3B82F6&color=fff',
            },
        })

        // Set session cookie
        setCookie(event, 'user_session', demoUser.id, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        return { success: true, user: demoUser }
    } catch (error: any) {
        console.error('Sign-in error:', error)
        return { success: false, error: error.message || 'Sign-in failed' }
    }
})
