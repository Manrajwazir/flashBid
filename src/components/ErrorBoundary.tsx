import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from './ui/Button'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error)
        console.error('Error info:', errorInfo)
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null })
    }

    private handleGoHome = () => {
        window.location.href = '/'
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="text-center max-w-lg">
                        {/* Error Icon */}
                        <div className="mb-8">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/20 rounded-lg border border-red-500/30 mb-4">
                                <span className="text-5xl">⚠️</span>
                            </div>
                        </div>

                        {/* Message */}
                        <h1 className="text-3xl font-black text-white mb-4">
                            Something Went Wrong
                        </h1>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            We encountered an unexpected error. Don't worry, our team has been notified.
                        </p>

                        {/* Error details (only in development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm font-mono text-red-400 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 justify-center">
                            <Button onClick={this.handleRetry}>
                                Try Again
                            </Button>
                            <Button variant="secondary" onClick={this.handleGoHome}>
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        )
    }
}
