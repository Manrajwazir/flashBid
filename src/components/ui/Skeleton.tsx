import { ReactNode } from 'react'

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
                className={`bg-[#2d1f40] ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            />
            {animation === 'shimmer' && (
                <style>{`
          .skeleton-shimmer {
            background: linear-gradient(
              90deg,
              #2d1f40 0%,
              #3d2a54 50%,
              #2d1f40 100%
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
        <div className="bg-[#1a1025] rounded-lg border border-[#3d2a54] overflow-hidden">
            <Skeleton className="h-56 w-full rounded-none" />
            <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-end pt-4 border-t border-[#3d2a54]">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-md" />
                </div>
            </div>
        </div>
    )
}

export function AuctionDetailSkeleton() {
    return (
        <div className="min-h-screen bg-[#0f0a1a] py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="aspect-square rounded-lg" />
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-24 rounded-lg" />
                        <Skeleton className="h-32 rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-[#3d2a54]">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    )
}
