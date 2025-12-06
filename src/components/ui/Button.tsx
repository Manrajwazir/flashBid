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
    const baseClasses = 'px-6 py-2.5 rounded-md font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'

    const variantClasses = {
        primary: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white shadow-lg shadow-purple-500/25',
        secondary: 'bg-[#2d1f40] hover:bg-[#3d2a54] text-white border border-[#3d2a54]',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg shadow-red-500/25',
        ghost: 'bg-transparent hover:bg-[#231730] text-gray-300',
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
