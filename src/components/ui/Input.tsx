interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-2 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    )
}
