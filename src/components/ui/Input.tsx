interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-[#c9d1d9] mb-1.5">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-3 py-2 rounded-md border text-sm transition-colors duration-150 focus:outline-none ${error
                    ? 'border-[#f85149] bg-[#0d1117] text-[#e6edf3]'
                    : 'border-[#30363d] bg-[#0d1117] hover:border-[#8b949e] focus:border-[#58a6ff] focus:shadow-[0_0_0_2px_rgba(88,166,255,0.3)] text-[#e6edf3] placeholder-[#6e7681]'
                    } ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-sm text-[#f85149]">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1.5 text-xs text-[#6e7681]">{helperText}</p>
            )}
        </div>
    )
}
