import { defineEventHandler, getCookie } from 'h3'
import { prisma } from '../../../src/db'

export default defineEventHandler(async (event) => {
    const sessionCookie = getCookie(event, 'user_session')

    if (sessionCookie) {
        const user = await prisma.user.findUnique({
            where: { id: sessionCookie },
        })

        if (user) {
            return { user, session: { id: sessionCookie } }
        }
    }

    return { user: null, session: null }
})
