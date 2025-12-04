import type { ReactNode } from 'react'

interface BadgeProps {
    children: ReactNode
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral'
    className?: string
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
    const variantClasses = {
        success: 'bg-green-100 text-green-700 border-green-200',
        danger: 'bg-red-100 text-red-700 border-red-200',
        warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        info: 'bg-blue-100 text-blue-700 border-blue-200',
        neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    }

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${variantClasses[variant]} ${className}`}
        >
            {children}
        </span>
    )
}
