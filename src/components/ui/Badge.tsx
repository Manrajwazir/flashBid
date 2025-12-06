import type { ReactNode } from 'react'

interface BadgeProps {
    children: ReactNode
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'purple'
    className?: string
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
    const variantClasses = {
        success: 'bg-green-500/20 text-green-400 border-green-500/30',
        danger: 'bg-red-500/20 text-red-400 border-red-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        neutral: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    }

    return (
        <span
            className={`px-3 py-1 rounded-md text-xs font-bold border ${variantClasses[variant]} ${className}`}
        >
            {children}
        </span>
    )
}
