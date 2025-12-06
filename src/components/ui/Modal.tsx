import { useEffect, useRef, ReactNode } from 'react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose()
    }

    // Focus trap
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            const firstElement = focusableElements[0] as HTMLElement
            firstElement?.focus()
        }
    }, [isOpen])

    if (!isOpen) return null

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    }

    return (
        <div
            ref={overlayRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
            <div
                ref={modalRef}
                className={`${sizeClasses[size]} w-full bg-[#1a1025] border border-[#3d2a54] rounded-lg shadow-2xl transform transition-all animate-slideUp`}
                style={{ animation: 'slideUp 0.3s ease-out' }}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#3d2a54]">
                        <h2 id="modal-title" className="text-xl font-bold text-white">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[#2d1f40] rounded-md transition-colors text-gray-400 hover:text-white"
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="px-6 py-4">
                    {children}
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </div>
    )
}
