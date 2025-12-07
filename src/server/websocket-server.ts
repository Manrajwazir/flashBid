import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'

// Use PORT env var for Render, fallback to 3001 for local dev
const WS_PORT = parseInt(process.env.PORT || '3001', 10)

// Store connected clients
const clients = new Map<WebSocket, { userId?: string; subscriptions: Set<string> }>()

// Create HTTP server for both WebSocket upgrades and broadcast requests
const server = createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        res.writeHead(200)
        res.end()
        return
    }

    if (req.method === 'POST' && req.url === '/broadcast') {
        let body = ''
        req.on('data', (chunk) => {
            body += chunk.toString()
        })
        req.on('end', () => {
            try {
                const data = JSON.parse(body)
                console.log('📢 Received broadcast request:', data.type)

                if (data.auctionId) {
                    broadcastToAuction(data.auctionId, data)
                } else {
                    broadcast(data)
                }

                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: true }))
            } catch (err) {
                console.error('Failed to process broadcast:', err)
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }))
            }
        })
    } else if (req.url === '/health') {
        res.writeHead(200)
        res.end('OK')
    } else {
        // Let WebSocket handling happen (handled by 'upgrade' event automatically if allowed, but for HTTP requests we 404)
        // Actually, for normal HTTP requests not handled above:
        res.writeHead(404)
        res.end('Not found')
    }
})

// Create WebSocket server attached to the HTTP server
const wss = new WebSocketServer({ server })

server.listen(WS_PORT, () => {
    console.log(`🚀 WebSocket & HTTP Broadcast Server running on port ${WS_PORT}`)
})

wss.on('connection', (ws) => {
    console.log('📥 Client connected')

    // Initialize client data
    clients.set(ws, { subscriptions: new Set() })

    // Send welcome message
    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to FlashBid WebSocket server' }))

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString())
            handleMessage(ws, message)
        } catch (err) {
            console.error('Failed to parse message:', err)
        }
    })

    ws.on('close', () => {
        console.log('📤 Client disconnected')
        clients.delete(ws)
    })

    ws.on('error', (err) => {
        console.error('WebSocket error:', err)
        clients.delete(ws)
    })

    // Heartbeat
    ws.on('pong', () => {
        // Client is alive
    })
})

// Heartbeat interval to detect dead connections
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping()
        }
    })
}, 30000)

// Handle incoming messages
function handleMessage(ws: WebSocket, message: any) {
    const clientData = clients.get(ws)
    if (!clientData) return

    switch (message.type) {
        case 'AUTH':
            // Associate user ID with connection
            clientData.userId = message.userId
            console.log(`🔐 User authenticated: ${message.userId}`)
            break

        case 'SUBSCRIBE':
            // Subscribe to auction updates
            if (message.auctionId) {
                clientData.subscriptions.add(message.auctionId)
                console.log(`📝 Subscribed to auction: ${message.auctionId}`)
            }
            break

        case 'UNSUBSCRIBE':
            // Unsubscribe from auction updates
            if (message.auctionId) {
                clientData.subscriptions.delete(message.auctionId)
                console.log(`📝 Unsubscribed from auction: ${message.auctionId}`)
            }
            break

        case 'PING':
            ws.send(JSON.stringify({ type: 'PONG' }))
            break

        default:
            console.log('Unknown message type:', message.type)
    }
}

// Broadcast to all clients
export function broadcast(message: object) {
    const data = JSON.stringify(message)
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data)
        }
    })
}

// Broadcast to clients subscribed to a specific auction
export function broadcastToAuction(auctionId: string, message: object) {
    const data = JSON.stringify(message)
    clients.forEach((clientData, ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            // Send to clients subscribed to this auction OR to all clients for general updates
            if (clientData.subscriptions.has(auctionId) || clientData.subscriptions.has('*')) {
                ws.send(data)
            }
        }
    })
}

// Broadcast to a specific user
export function broadcastToUser(userId: string, message: object) {
    const data = JSON.stringify(message)
    clients.forEach((clientData, ws) => {
        if (ws.readyState === WebSocket.OPEN && clientData.userId === userId) {
            ws.send(data)
        }
    })
}

// For importing in functions.ts to trigger broadcasts
export { wss, clients }

