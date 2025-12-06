interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-bold text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${error
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-[#3d2a54] bg-[#0f0a1a] hover:border-purple-500/50 text-white placeholder-gray-500'
                    } ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-2 text-sm text-red-400 font-medium">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-2 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    )
}

