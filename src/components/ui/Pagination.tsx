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
        `px-3 py-2 rounded-md font-semibold transition-all ${isDisabled
            ? 'bg-[#1a1025] text-gray-600 cursor-not-allowed'
            : isActive
                ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                : 'bg-[#2d1f40] text-gray-300 hover:bg-[#3d2a54] border border-[#3d2a54]'
        }`

    return (
        <nav className="flex items-center justify-center gap-2 flex-wrap" aria-label="Pagination">
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
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
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
            <span className="text-sm text-gray-400">Show:</span>
            <select
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="px-3 py-2 rounded-md bg-[#2d1f40] border border-[#3d2a54] text-white font-semibold focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
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
