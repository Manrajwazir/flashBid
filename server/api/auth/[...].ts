import { defineEventHandler, getRequestURL, getHeaders, readBody, getMethod } from 'h3'
import { auth } from '../../../src/auth'

// Catch-all handler for better-auth OAuth routes
export default defineEventHandler(async (event) => {
    const url = getRequestURL(event)
    const method = getMethod(event)

    console.log(`🔐 [AuthDebug] ${method} ${url}`)

    const headers = getHeaders(event)
    console.log(`🔐 [AuthDebug] Headers:`, headers)

    let body: any = undefined
    if (method !== 'GET' && method !== 'HEAD') {
        try {
            body = await readBody(event)
            console.log(`🔐 [AuthDebug] Body payload:`, body)
        } catch (e) {
            console.log(`🔐 [AuthDebug] No body or check failed:`, e)
        }
    }

    const request = new Request(url.toString(), {
        method,
        headers: headers as HeadersInit,
        body: body ? JSON.stringify(body) : undefined,
    })

    try {
        console.log(`🔐 [AuthDebug] Calling auth.handler...`)
        const response = await auth.handler(request)
        console.log(`🔐 [AuthDebug] Response status:`, response.status)
        return response
    } catch (err) {
        console.error(`❌ [AuthDebug] Handler error:`, err)
        throw err
    }
})
