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
        md: 'text-base',
        lg: 'text-xl',
    }

    const urgencyClasses = {
        normal: 'text-[#8b949e]',
        warning: 'text-[#d29922]',
        critical: 'text-[#f85149] animate-pulse',
        ended: 'text-[#6e7681]',
    }

    return (
        <div className={`font-mono font-medium ${sizeClasses[size]} ${urgencyClasses[urgency]}`}>
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
        normal: 'bg-[#21262d] text-[#8b949e]',
        warning: 'bg-[#d29922]/20 text-[#d29922]',
        critical: 'bg-[#f85149]/20 text-[#f85149] animate-pulse',
        ended: 'bg-[#21262d] text-[#6e7681]',
    }

    return (
        <div
            className={`px-2 py-0.5 rounded text-xs font-mono ${urgencyClasses[urgency]}`}
        >
            {urgency === 'critical' && '⏰ '}
            {timeRemaining}
        </div>
    )
}


