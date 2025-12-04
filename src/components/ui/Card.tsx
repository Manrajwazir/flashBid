import type { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
    return (
        <div
            className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${hover ? 'hover:shadow-xl transition-shadow duration-300' : ''
                } ${className}`}
        >
            {children}
        </div>
    )
}
