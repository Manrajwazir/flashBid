import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    type: ToastType
    message: string
}

interface ToastContextValue {
    success: (message: string) => void
    error: (message: string) => void
    warning: (message: string) => void
    info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, type, message }])

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 5000)
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const value: ToastContextValue = {
        success: (message) => addToast('success', message),
        error: (message) => addToast('error', message),
        warning: (message) => addToast('warning', message),
        info: (message) => addToast('info', message),
    }

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const config = {
        success: {
            bg: 'bg-green-500/20',
            border: 'border-green-500/30',
            text: 'text-green-400',
            icon: '✓',
        },
        error: {
            bg: 'bg-red-500/20',
            border: 'border-red-500/30',
            text: 'text-red-400',
            icon: '✕',
        },
        warning: {
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/30',
            text: 'text-yellow-400',
            icon: '⚠',
        },
        info: {
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/30',
            text: 'text-blue-400',
            icon: 'ℹ',
        },
    }

    const { bg, border, text, icon } = config[toast.type]

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-md ${bg} border ${border} backdrop-blur-lg shadow-lg animate-slideIn`}
            style={{ animation: 'slideIn 0.3s ease-out' }}
        >
            <span className={`text-lg ${text}`}>{icon}</span>
            <p className={`flex-1 text-sm font-medium ${text}`}>{toast.message}</p>
            <button
                onClick={onClose}
                className={`p-1 hover:bg-white/10 rounded transition-colors ${text}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
        </div>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
