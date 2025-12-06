import { useState, useEffect, useRef } from 'react'
import { formatTimeRemaining, getUrgencyLevel } from '../../lib/utils'

interface CountdownTimerProps {
    endsAt: Date | string
    onExpire?: () => void
    size?: 'sm' | 'md' | 'lg'
}

export function CountdownTimer({ endsAt, onExpire, size = 'md' }: CountdownTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState('')
    const [urgency, setUrgency] = useState<'normal' | 'warning' | 'critical' | 'ended'>('normal')
    const hasExpiredRef = useRef(false)
    const onExpireRef = useRef(onExpire)

    // Keep the ref updated with the latest callback
    useEffect(() => {
        onExpireRef.current = onExpire
    }, [onExpire])

    useEffect(() => {
        // Reset expired flag when endsAt changes
        hasExpiredRef.current = false

        const updateTimer = () => {
            const endDate = new Date(endsAt)
            const now = new Date()
            const diff = endDate.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeRemaining('Ended')
                setUrgency('ended')
                // Only call onExpire once
                if (!hasExpiredRef.current) {
                    hasExpiredRef.current = true
                    onExpireRef.current?.()
                }
                return true // Signal that auction has ended
            }

            setTimeRemaining(formatTimeRemaining(diff))
            setUrgency(getUrgencyLevel(diff))
            return false
        }

        // Initial update - if already ended, don't set up interval
        if (updateTimer()) {
            return
        }

        const interval = setInterval(() => {
            if (updateTimer()) {
                clearInterval(interval)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [endsAt]) // Only depend on endsAt, not onExpire

    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-2xl',
    }

    const urgencyClasses = {
        normal: 'text-gray-300',
        warning: 'text-yellow-400',
        critical: 'text-red-400 animate-pulse',
        ended: 'text-gray-500',
    }

    return (
        <div className={`font-mono font-bold ${sizeClasses[size]} ${urgencyClasses[urgency]}`}>
            {urgency === 'critical' && <span className="mr-1">⏰</span>}
            {timeRemaining}
        </div>
    )
}

interface CompactCountdownProps {
    endsAt: Date | string
    onExpire?: () => void
}

export function CompactCountdown({ endsAt, onExpire }: CompactCountdownProps) {
    const [timeRemaining, setTimeRemaining] = useState('')
    const [urgency, setUrgency] = useState<'normal' | 'warning' | 'critical' | 'ended'>('normal')
    const hasExpiredRef = useRef(false)
    const onExpireRef = useRef(onExpire)

    // Keep the ref updated with the latest callback
    useEffect(() => {
        onExpireRef.current = onExpire
    }, [onExpire])

    useEffect(() => {
        // Reset expired flag when endsAt changes
        hasExpiredRef.current = false

        const updateTimer = () => {
            const endDate = new Date(endsAt)
            const now = new Date()
            const diff = endDate.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeRemaining('Ended')
                setUrgency('ended')
                // Only call onExpire once
                if (!hasExpiredRef.current) {
                    hasExpiredRef.current = true
                    onExpireRef.current?.()
                }
                return true // Signal that auction has ended
            }

            setTimeRemaining(formatTimeRemaining(diff))
            setUrgency(getUrgencyLevel(diff))
            return false
        }

        // Initial update - if already ended, don't set up interval
        if (updateTimer()) {
            return
        }

        const interval = setInterval(() => {
            if (updateTimer()) {
                clearInterval(interval)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [endsAt]) // Only depend on endsAt, not onExpire

    const urgencyClasses = {
        normal: 'bg-[#1a1025]/90 text-gray-300 border-[#3d2a54]',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        critical: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
        ended: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
    }

    return (
        <div
            className={`px-2 py-1 rounded-md text-xs font-mono font-bold backdrop-blur-md border ${urgencyClasses[urgency]}`}
        >
            {urgency === 'critical' && '⏰ '}
            {timeRemaining}
        </div>
    )
}


