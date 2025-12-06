import { useWebSocket } from './WebSocketProvider'

export function ConnectionStatus() {
    const { status } = useWebSocket()

    const statusConfig: Record<string, { color: string; text: string }> = {
        connecting: { color: 'bg-yellow-500', text: 'Connecting...' },
        connected: { color: 'bg-purple-500', text: 'Live' },
        disconnected: { color: 'bg-red-500', text: 'Offline' },
        error: { color: 'bg-red-500', text: 'Error' },
    }

    const config = statusConfig[status] || statusConfig.connecting
    const dotClass = 'relative inline-flex rounded-full h-2 w-2 ' + config.color

    return (
        <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
                {status === 'connected' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                )}
                <span className={dotClass} />
            </span>
            <span className="text-xs font-medium text-gray-400">{config.text}</span>
        </div>
    )
}
