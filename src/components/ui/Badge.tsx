import type { ReactNode } from 'react'

interface BadgeProps {
    children: ReactNode
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral'
    className?: string
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
    const variantClasses = {
        success: 'bg-[#238636]/20 text-[#3fb950]',
        danger: 'bg-[#f85149]/20 text-[#f85149]',
        warning: 'bg-[#d29922]/20 text-[#d29922]',
        info: 'bg-[#58a6ff]/20 text-[#58a6ff]',
        neutral: 'bg-[#30363d] text-[#8b949e]',
    }

    return (
        <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${variantClasses[variant]} ${className}`}
        >
            {children}
        </span>
    )
}
