import type { ReactNode } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    isLoading?: boolean
    children: ReactNode
}

export function Button({
    variant = 'primary',
    isLoading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClasses = 'px-6 py-2.5 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'

    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-900',
    }

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                </span>
            ) : children}
        </button>
    )
}
