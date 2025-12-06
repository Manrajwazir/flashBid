import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

// Message types from server
export interface WSMessage {
    type: string
    [key: string]: any
}

export interface BidUpdate {
    type: 'BID_PLACED'
    auctionId: string
    newPrice: number
    bidderId: string
    bidderName?: string
    timestamp: string
}

export interface AuctionUpdate {
    type: 'AUCTION_UPDATED' | 'AUCTION_CLOSED' | 'AUCTION_CREATED'
    auctionId: string
    data?: any
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface WebSocketContextValue {
    status: ConnectionStatus
    lastMessage: WSMessage | null
    subscribe: (auctionId: string) => void
    unsubscribe: (auctionId: string) => void
    authenticate: (userId: string) => void
    sendMessage: (message: object) => void
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

const WS_URL = 'ws://localhost:3001'
const RECONNECT_INTERVALS = [1000, 2000, 4000, 8000, 16000, 30000] // Exponential backoff

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected')
    const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectAttemptRef = useRef(0)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const subscriptionsRef = useRef<Set<string>>(new Set())
    const userIdRef = useRef<string | null>(null)

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return

        setStatus('connecting')

        try {
            const ws = new WebSocket(WS_URL)
            wsRef.current = ws

            ws.onopen = () => {
                console.log('🔌 WebSocket connected')
                setStatus('connected')
                reconnectAttemptRef.current = 0

                // Re-authenticate if we have a user ID
                if (userIdRef.current) {
                    ws.send(JSON.stringify({ type: 'AUTH', userId: userIdRef.current }))
                }

                // Re-subscribe to all previous subscriptions
                subscriptionsRef.current.forEach((auctionId) => {
                    ws.send(JSON.stringify({ type: 'SUBSCRIBE', auctionId }))
                })
            }

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as WSMessage
                    setLastMessage(message)
                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err)
                }
            }

            ws.onclose = () => {
                console.log('🔌 WebSocket disconnected')
                setStatus('disconnected')
                wsRef.current = null
                scheduleReconnect()
            }

            ws.onerror = (error) => {
                console.error('WebSocket error:', error)
                setStatus('error')
            }
        } catch (err) {
            console.error('Failed to create WebSocket:', err)
            setStatus('error')
            scheduleReconnect()
        }
    }, [])

    const scheduleReconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) return

        const delay = RECONNECT_INTERVALS[
            Math.min(reconnectAttemptRef.current, RECONNECT_INTERVALS.length - 1)
        ]

        console.log(`🔄 Reconnecting in ${delay / 1000}s...`)

        reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null
            reconnectAttemptRef.current++
            connect()
        }, delay)
    }, [connect])

    const sendMessage = useCallback((message: object) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message))
        }
    }, [])

    const subscribe = useCallback((auctionId: string) => {
        subscriptionsRef.current.add(auctionId)
        sendMessage({ type: 'SUBSCRIBE', auctionId })
    }, [sendMessage])

    const unsubscribe = useCallback((auctionId: string) => {
        subscriptionsRef.current.delete(auctionId)
        sendMessage({ type: 'UNSUBSCRIBE', auctionId })
    }, [sendMessage])

    const authenticate = useCallback((userId: string) => {
        userIdRef.current = userId
        sendMessage({ type: 'AUTH', userId })
    }, [sendMessage])

    // Connect on mount
    useEffect(() => {
        connect()

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [connect])

    return (
        <WebSocketContext.Provider
            value={{ status, lastMessage, subscribe, unsubscribe, authenticate, sendMessage }}
        >
            {children}
        </WebSocketContext.Provider>
    )
}

export function useWebSocket() {
    const context = useContext(WebSocketContext)
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider')
    }
    return context
}
