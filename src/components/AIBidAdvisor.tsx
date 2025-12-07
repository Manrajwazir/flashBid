import { useState } from 'react'
import { predictAuctionOutcome } from '../server/ai-functions'
import { formatCurrency } from '../lib/utils'

interface AIBidAdvisorProps {
    title: string
    description: string
    currentPrice: number
    startPrice: number
    bidCount: number
    endsAt: Date | string
    isEnded: boolean
}

interface PredictionData {
    predictedMinPrice: number
    predictedMaxPrice: number
    confidence: 'High' | 'Medium' | 'Low'
    analysis: string
    suggestedBid: number
    bidAdvice: string
}

export function AIBidAdvisor({
    title,
    description,
    currentPrice,
    startPrice,
    bidCount,
    endsAt,
    isEnded,
}: AIBidAdvisorProps) {
    const [prediction, setPrediction] = useState<PredictionData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const timeRemainingMs = new Date(endsAt).getTime() - Date.now()

    const loadPrediction = async () => {
        if (isEnded) return

        setIsLoading(true)
        setError(null)

        try {
            const result = await predictAuctionOutcome({
                data: {
                    title,
                    description,
                    currentPrice,
                    startPrice,
                    bidCount,
                    timeRemainingMs,
                }
            } as any)

            if (result.success && result.data) {
                setPrediction(result.data as PredictionData)
            } else {
                setError(result.error || 'Failed to get prediction')
            }
        } catch (err: any) {
            console.error('Prediction error:', err)
            setError(err.message || 'Failed to get prediction')
        } finally {
            setIsLoading(false)
        }
    }

    if (isEnded) {
        return null
    }

    const confidenceColor = {
        High: 'text-[#3fb950] bg-[#238636]/20',
        Medium: 'text-[#d29922] bg-[#d29922]/20',
        Low: 'text-[#f85149] bg-[#f85149]/20',
    }

    return (
        <div className="bg-[#161b22] rounded-md p-4 border border-[#30363d]">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🤖</span>
                <h3 className="font-semibold text-sm text-[#e6edf3]">AI Bid Advisor</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-[#58a6ff]/20 text-[#58a6ff] rounded-full">
                    AI
                </span>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-3 py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#58a6ff] border-t-transparent"></div>
                    <span className="text-[#8b949e] text-sm">Analyzing auction data...</span>
                </div>
            ) : error ? (
                <div className="py-2">
                    <p className="text-[#d29922] text-sm mb-2">⚠️ {error}</p>
                    <button
                        onClick={loadPrediction}
                        className="text-sm text-[#58a6ff] hover:underline"
                    >
                        Try again
                    </button>
                </div>
            ) : prediction ? (
                <div className="space-y-3">
                    {/* Price Prediction */}
                    <div className="flex items-center justify-between">
                        <span className="text-[#8b949e] text-sm">Predicted Final Price:</span>
                        <span className="font-mono font-semibold text-[#e6edf3]">
                            {formatCurrency(prediction.predictedMinPrice)} - {formatCurrency(prediction.predictedMaxPrice)}
                        </span>
                    </div>

                    {/* Suggested Bid */}
                    <div className="bg-[#0d1117] rounded-md p-3 border border-[#30363d]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[#8b949e] text-sm">💡 Suggested Winning Bid:</span>
                            <span className="font-mono font-bold text-[#3fb950]">
                                {formatCurrency(prediction.suggestedBid)}
                            </span>
                        </div>
                        <p className="text-[#6e7681] text-xs">{prediction.bidAdvice}</p>
                    </div>

                    {/* Analysis */}
                    <div className="flex items-start gap-2">
                        <span className="text-[#6e7681] text-xs mt-0.5">📊</span>
                        <p className="text-[#8b949e] text-xs">{prediction.analysis}</p>
                    </div>

                    {/* Confidence */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#30363d]">
                        <span className="text-[#6e7681] text-xs">AI Confidence:</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${confidenceColor[prediction.confidence]}`}>
                            {prediction.confidence}
                        </span>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={loadPrediction}
                        disabled={isLoading}
                        className="w-full py-2 text-sm text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                        <span>🔄</span>
                        <span>Refresh</span>
                    </button>
                </div>
            ) : (
                <button
                    onClick={loadPrediction}
                    className="w-full py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <span>✨</span>
                    <span>Get AI Price Prediction</span>
                </button>
            )}
        </div>
    )
}
