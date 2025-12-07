interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    showFirstLast?: boolean
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    showFirstLast = false,
}: PaginationProps) {
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = []
        const showEllipsis = totalPages > 7

        if (!showEllipsis) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)

            if (currentPage > 3) pages.push('ellipsis')

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) pages.push(i)

            if (currentPage < totalPages - 2) pages.push('ellipsis')

            pages.push(totalPages)
        }

        return pages
    }

    const buttonClass = (isActive: boolean, isDisabled: boolean = false) =>
        `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isDisabled
            ? 'bg-[#21262d] text-[#6e7681] cursor-not-allowed'
            : isActive
                ? 'bg-[#1f6feb] text-white'
                : 'bg-[#21262d] text-[#8b949e] hover:bg-[#30363d] border border-[#30363d]'
        }`

    return (
        <nav className="flex items-center justify-center gap-1 flex-wrap" aria-label="Pagination">
            {showFirstLast && (
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={buttonClass(false, currentPage === 1)}
                    aria-label="First page"
                >
                    ««
                </button>
            )}

            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={buttonClass(false, currentPage === 1)}
                aria-label="Previous page"
            >
                ← Prev
            </button>

            {getPageNumbers().map((page, index) =>
                page === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-[#6e7681]">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={buttonClass(page === currentPage)}
                        aria-current={page === currentPage ? 'page' : undefined}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={buttonClass(false, currentPage === totalPages)}
                aria-label="Next page"
            >
                Next →
            </button>

            {showFirstLast && (
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={buttonClass(false, currentPage === totalPages)}
                    aria-label="Last page"
                >
                    »»
                </button>
            )}
        </nav>
    )
}

interface ItemsPerPageSelectorProps {
    value: number
    onChange: (value: number) => void
    options?: number[]
}

export function ItemsPerPageSelector({
    value,
    onChange,
    options = [10, 20, 50],
}: ItemsPerPageSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b949e]">Show:</span>
            <select
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="px-2 py-1 rounded-md bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-sm focus:border-[#58a6ff] focus:outline-none transition-colors"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    )
}
