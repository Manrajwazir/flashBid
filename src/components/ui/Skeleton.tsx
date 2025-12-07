

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    animation?: 'pulse' | 'shimmer' | 'none'
}

export function Skeleton({
    className = '',
    variant = 'rectangular',
    animation = 'shimmer',
}: SkeletonProps) {
    const variantClasses = {
        text: 'rounded-md h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-md',
    }

    const animationClasses = {
        pulse: 'animate-pulse',
        shimmer: 'skeleton-shimmer',
        none: '',
    }

    return (
        <>
            <div
                className={`bg-[#21262d] ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            />
            {animation === 'shimmer' && (
                <style>{`
          .skeleton-shimmer {
            background: linear-gradient(
              90deg,
              #21262d 0%,
              #30363d 50%,
              #21262d 100%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
            )}
        </>
    )
}

export function AuctionCardSkeleton() {
    return (
        <div className="bg-[#161b22] rounded-md border border-[#30363d] overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex justify-between items-end pt-3 border-t border-[#30363d]">
                    <div className="space-y-1">
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-md" />
                </div>
            </div>
        </div>
    )
}

export function AuctionDetailSkeleton() {
    return (
        <div className="min-h-screen bg-[#0d1117] py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="aspect-square rounded-md" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-20 rounded-md" />
                        <Skeleton className="h-24 rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-[#30363d]">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-3 px-3">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    )
}
