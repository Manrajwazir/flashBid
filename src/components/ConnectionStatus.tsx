import { useWebSocket } from './WebSocketProvider'

export function ConnectionStatus() {
    const { status } = useWebSocket()

    const statusConfig: Record<string, { color: string; text: string }> = {
        connecting: { color: 'bg-[#d29922]', text: 'Connecting...' },
        connected: { color: 'bg-[#3fb950]', text: 'Live' },
        disconnected: { color: 'bg-[#f85149]', text: 'Offline' },
        error: { color: 'bg-[#f85149]', text: 'Error' },
    }

    const config = statusConfig[status] || statusConfig.connecting
    const dotClass = 'relative inline-flex rounded-full h-2 w-2 ' + config.color

    return (
        <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
                {status === 'connected' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75" />
                )}
                <span className={dotClass} />
            </span>
            <span className="text-xs font-medium text-[#8b949e]">{config.text}</span>
        </div>
    )
}
