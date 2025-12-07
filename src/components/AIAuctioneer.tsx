import { useState, useEffect, useRef, useCallback } from 'react'
import { generateAuctioneerCommentary } from '../server/ai-functions'

interface AIAuctioneerProps {
    auctionTitle: string
    currentPrice: number
    startPrice: number
    bidCount: number
    timeRemainingMs: number
    lastBidderName?: string
    isEnded: boolean
}

interface CommentaryItem {
    id: number
    text: string
    type: 'bid' | 'time' | 'hype' | 'end'
    timestamp: Date
}

// Transition phrases when interrupting for a new bid
const INTERRUPT_PHRASES = [
    "Wait, hold on—",
    "But wait!",
    "Oh! Breaking news!",
    "Stop the presses!",
    "And just like that—",
    "Here we go again!",
    "Another one!",
    "Whoa!",
]

export function AIAuctioneer({
    auctionTitle,
    currentPrice,
    startPrice,
    bidCount,
    timeRemainingMs,
    lastBidderName,
    isEnded,
}: AIAuctioneerProps) {
    const [commentary, setCommentary] = useState<CommentaryItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isTTSEnabled, setIsTTSEnabled] = useState(false)
    const [isExpanded, setIsExpanded] = useState(true)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const lastPriceRef = useRef(currentPrice)
    const lastBidCountRef = useRef(bidCount)
    const commentIdRef = useRef(0)
    const pendingTextRef = useRef<string | null>(null)

    // Get a random interrupt phrase
    const getInterruptPhrase = () => {
        return INTERRUPT_PHRASES[Math.floor(Math.random() * INTERRUPT_PHRASES.length)]
    }

    // Find the best voice - prefer more natural-sounding ones
    const getBestVoice = useCallback(() => {
        if (typeof window === 'undefined') return null

        const voices = window.speechSynthesis.getVoices()

        // Prefer voices in this order
        const preferredVoices = [
            'Google US English',
            'Google UK English Male',
            'Google UK English Female',
            'Microsoft David',
            'Microsoft Zira',
            'Samantha',
            'Alex',
            'Daniel',
        ]

        for (const preferred of preferredVoices) {
            const voice = voices.find(v => v.name.includes(preferred))
            if (voice) return voice
        }

        // Fall back to first English voice
        return voices.find(v => v.lang.startsWith('en')) || voices[0] || null
    }, [])

    // Text-to-speech function with interruption support
    const speak = useCallback((text: string, interrupt = false) => {
        if (!isTTSEnabled || typeof window === 'undefined') return

        // If currently speaking and we need to interrupt
        if (interrupt && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel()
            // Add transition phrase
            const transitionText = `${getInterruptPhrase()} ${text}`
            pendingTextRef.current = transitionText
        } else {
            pendingTextRef.current = text
        }

        // Small delay to ensure cancel is processed
        setTimeout(() => {
            if (!pendingTextRef.current) return

            const utterance = new SpeechSynthesisUtterance(pendingTextRef.current)

            // Find best voice
            const voice = getBestVoice()
            if (voice) utterance.voice = voice

            // Faster but still clear settings
            utterance.rate = 1.2   // Moderately faster speech
            utterance.pitch = 1.1  // Slightly higher pitch for energy
            utterance.volume = 0.9

            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => setIsSpeaking(false)
            utterance.onerror = () => setIsSpeaking(false)

            window.speechSynthesis.speak(utterance)
            pendingTextRef.current = null
        }, 50)
    }, [isTTSEnabled, getBestVoice])

    // Load voices when TTS is enabled
    useEffect(() => {
        if (isTTSEnabled && typeof window !== 'undefined') {
            // Chrome loads voices async
            window.speechSynthesis.getVoices()
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices()
            }
        }
    }, [isTTSEnabled])

    // Add new commentary
    const addCommentary = useCallback((text: string, type: CommentaryItem['type'], shouldInterrupt = false) => {
        const newItem: CommentaryItem = {
            id: ++commentIdRef.current,
            text,
            type,
            timestamp: new Date(),
        }
        setCommentary(prev => [newItem, ...prev].slice(0, 10)) // Keep last 10
        speak(text, shouldInterrupt)
    }, [speak])

    // Generate AI commentary for events
    const generateCommentary = useCallback(async (event: string, context: object, shouldInterrupt = false) => {
        if (isLoading) return

        setIsLoading(true)
        try {
            const result = await generateAuctioneerCommentary({
                data: { event, ...context }
            } as any)

            if (result.success && result.commentary) {
                addCommentary(result.commentary, event as CommentaryItem['type'], shouldInterrupt)
            }
        } catch (error) {
            console.error('Auctioneer error:', error)
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, addCommentary])

    // React to bid changes - always interrupt for new bids!
    useEffect(() => {
        if (bidCount > lastBidCountRef.current && !isEnded) {
            const priceIncrease = ((currentPrice - startPrice) / startPrice * 100).toFixed(0)
            generateCommentary('bid', {
                auctionTitle,
                currentPrice,
                priceIncrease,
                bidCount,
                lastBidderName: lastBidderName || 'Anonymous',
            }, true) // Interrupt for new bids
            lastBidCountRef.current = bidCount
            lastPriceRef.current = currentPrice
        }
    }, [bidCount, isEnded, currentPrice, startPrice, auctionTitle, lastBidderName, generateCommentary])

    // React to time warnings
    useEffect(() => {
        if (isEnded) return

        const minutes = timeRemainingMs / 60000

        if (minutes <= 1 && minutes > 0.5) {
            // 1 minute warning
            generateCommentary('time', {
                auctionTitle,
                currentPrice,
                timeRemaining: 'one minute',
            }, false)
        } else if (minutes <= 0.5 && minutes > 0) {
            // 30 seconds warning
            generateCommentary('time', {
                auctionTitle,
                currentPrice,
                timeRemaining: 'thirty seconds',
            }, true) // Interrupt for final countdown
        }
    }, [Math.floor(timeRemainingMs / 30000)]) // Check every 30 seconds

    // Auction end
    useEffect(() => {
        if (isEnded && commentary.length > 0 && !commentary.some(c => c.type === 'end')) {
            const hasWinner = auctionTitle && currentPrice > startPrice
            let endMessage = ''

            if (hasWinner) {
                // If we have a winner (logic simplified since we don't have direct winner object here, inferring from price)
                endMessage = `SOLD! The ${auctionTitle} is officially SOLD for ${currentPrice.toFixed(2)}! Congratulations to the winner! Please check your dashboard for contact details.`
            } else {
                endMessage = `And that's it! The auction for ${auctionTitle} has ended without a sale.`
            }

            addCommentary(endMessage, 'end', true)
        }
    }, [isEnded, commentary, auctionTitle, currentPrice, addCommentary])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined') {
                window.speechSynthesis.cancel()
            }
        }
    }, [])

    if (isEnded && commentary.length === 0) {
        return null
    }

    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between px-3 py-2 bg-[#21262d] border-b border-[#30363d] cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <span className={`text-base ${isSpeaking ? 'animate-pulse' : ''}`}>🎙️</span>
                    <span className="font-semibold text-sm text-[#e6edf3]">AI Auctioneer</span>
                    {isLoading && (
                        <span className="flex items-center gap-1 text-xs text-[#8b949e]">
                            <span className="animate-pulse">●</span> thinking...
                        </span>
                    )}
                    {isSpeaking && !isLoading && (
                        <span className="flex items-center gap-1 text-xs text-[#3fb950]">
                            <span className="animate-pulse">●</span> speaking
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsTTSEnabled(!isTTSEnabled)
                            if (isTTSEnabled && typeof window !== 'undefined') {
                                window.speechSynthesis.cancel()
                            }
                        }}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${isTTSEnabled
                            ? 'bg-[#238636] text-white'
                            : 'bg-[#21262d] text-[#8b949e] border border-[#30363d]'
                            }`}
                    >
                        {isTTSEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
                    </button>
                    <span className="text-[#8b949e] text-sm">{isExpanded ? '▼' : '▶'}</span>
                </div>
            </div>

            {/* Commentary Feed */}
            {isExpanded && (
                <div className="p-3 max-h-48 overflow-y-auto">
                    {commentary.length === 0 ? (
                        <p className="text-[#8b949e] text-sm text-center py-4">
                            Waiting for auction activity... 🎤
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {commentary.map((item) => (
                                <div
                                    key={item.id}
                                    className={`p-2 rounded-md text-sm ${item.type === 'end'
                                        ? 'bg-[#238636]/20 border border-[#238636]/30'
                                        : 'bg-[#0d1117] border border-[#30363d]'
                                        }`}
                                >
                                    <p className="text-[#e6edf3]">{item.text}</p>
                                    <p className="text-[#6e7681] text-xs mt-1">
                                        {item.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
