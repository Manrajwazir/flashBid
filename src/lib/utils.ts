/**
 * Utility functions for FlashBid
 */

/**
 * Format a number as USD currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

/**
 * Calculate the minimum bid increment based on current price
 * Returns the greater of $1 or 5% of current price
 */
export function getMinBidIncrement(currentPrice: number): number {
    const fivePercent = currentPrice * 0.05
    return Math.max(1, Math.ceil(fivePercent * 100) / 100)
}

/**
 * Calculate the minimum next bid amount
 */
export function getMinBidAmount(currentPrice: number): number {
    return currentPrice + getMinBidIncrement(currentPrice)
}

/**
 * Format time remaining as a human-readable string
 * @param endsAtOrDiff - Either a Date/string representing the end time, or a number representing milliseconds remaining
 */
export function formatTimeRemaining(endsAtOrDiff: Date | string | number): string {
    let diff: number
    if (typeof endsAtOrDiff === 'number') {
        diff = endsAtOrDiff
    } else {
        const end = new Date(endsAtOrDiff).getTime()
        const now = Date.now()
        diff = end - now
    }

    if (diff <= 0) return 'Ended'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
}

/**
 * Get urgency level based on time remaining
 * @param endsAtOrDiff - Either a Date/string representing the end time, or a number representing milliseconds remaining
 */
export function getUrgencyLevel(endsAtOrDiff: Date | string | number): 'normal' | 'warning' | 'critical' | 'ended' {
    let diff: number
    if (typeof endsAtOrDiff === 'number') {
        diff = endsAtOrDiff
    } else {
        const end = new Date(endsAtOrDiff).getTime()
        const now = Date.now()
        diff = end - now
    }

    if (diff <= 0) return 'ended'
    if (diff < 5 * 60 * 1000) return 'critical' // < 5 minutes
    if (diff < 60 * 60 * 1000) return 'warning' // < 1 hour
    return 'normal'
}

/**
 * Merge class names conditionally (simplified version of clsx/cn)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

/**
 * Validate image URL format
 */
export function isValidImageUrl(url: string): boolean {
    if (!url) return true // Optional
    try {
        const parsed = new URL(url)
        return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
        return false
    }
}

/**
 * Debounce function for rate limiting
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 9)
}
