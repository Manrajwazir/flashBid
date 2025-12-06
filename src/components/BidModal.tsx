import { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { formatCurrency, getMinBidAmount, getMinBidIncrement } from '../lib/utils'
import { placeBid } from '../server/functions'
import { useToast } from './ToastProvider'

interface Auction {
    id: string
    title: string
    currentPrice: number
    imageUrl?: string | null
}

interface BidModalProps {
    isOpen: boolean
    onClose: () => void
    auction: Auction | null
    userId: string
    onBidPlaced?: (newPrice: number) => void
}

type Step = 'input' | 'confirm' | 'success'

const QUICK_BID_INCREMENTS = [5, 10, 25, 50, 100]

export function BidModal({ isOpen, onClose, auction, userId, onBidPlaced }: BidModalProps) {
    const toast = useToast()
    const [step, setStep] = useState<Step>('input')
    const [bidAmount, setBidAmount] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Reset state when modal opens/closes or auction changes
    useEffect(() => {
        if (isOpen && auction) {
            const minBid = getMinBidAmount(auction.currentPrice)
            setBidAmount(minBid.toFixed(2))
            setStep('input')
            setError(null)
        }
    }, [isOpen, auction])

    if (!auction) return null

    const minBid = getMinBidAmount(auction.currentPrice)
    const minIncrement = getMinBidIncrement(auction.currentPrice)
    const parsedBidAmount = parseFloat(bidAmount) || 0

    const handleQuickBid = (increment: number) => {
        const newAmount = auction.currentPrice + increment
        setBidAmount(newAmount.toFixed(2))
        setError(null)
    }

    const handleInputChange = (value: string) => {
        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
            setBidAmount(value)
            setError(null)
        }
    }

    const validateBid = (): boolean => {
        if (parsedBidAmount < minBid) {
            setError(`Minimum bid is ${formatCurrency(minBid)} (at least ${formatCurrency(minIncrement)} more than current price)`)
            return false
        }
        return true
    }

    const handleContinue = () => {
        if (validateBid()) {
            setStep('confirm')
        }
    }

    const handleSubmitBid = async () => {
        if (!validateBid()) return

        setIsSubmitting(true)
        setError(null)

        try {
            const result = await placeBid({
                data: {
                    auctionId: auction.id,
                    amount: parsedBidAmount,
                    userId,
                },
            } as any)

            if (result.success) {
                setStep('success')
                toast.success(`Bid of ${formatCurrency(parsedBidAmount)} placed successfully!`)
                onBidPlaced?.(parsedBidAmount)

                setTimeout(() => {
                    onClose()
                }, 2000)
            } else {
                setError(result.error || 'Failed to place bid')
                setStep('input')
                toast.error(result.error || 'Failed to place bid')
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred')
            setStep('input')
            toast.error(err.message || 'An error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBack = () => {
        setStep('input')
        setError(null)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={step === 'success' ? '' : 'Place a Bid'} size="md">
            {step === 'input' && (
                <div className="space-y-6">
                    {/* Auction Info */}
                    <div className="flex items-center gap-4 p-4 bg-[#0f0a1a] rounded-lg border border-[#3d2a54]">
                        {auction.imageUrl && (
                            <img
                                src={auction.imageUrl}
                                alt={auction.title}
                                className="w-16 h-16 object-cover rounded-md"
                            />
                        )}
                        <div>
                            <h3 className="font-bold text-white">{auction.title}</h3>
                            <p className="text-sm text-gray-400">Current price</p>
                            <p className="text-xl font-mono font-bold text-purple-400">
                                {formatCurrency(auction.currentPrice)}
                            </p>
                        </div>
                    </div>

                    {/* Minimum bid info */}
                    <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <p className="text-sm text-purple-300">
                            Minimum bid: <span className="font-bold">{formatCurrency(minBid)}</span>
                            <span className="text-purple-400 ml-1">
                                (+{formatCurrency(minIncrement)} increment)
                            </span>
                        </p>
                    </div>

                    {/* Quick bid buttons */}
                    <div>
                        <p className="text-sm font-semibold text-gray-300 mb-2">Quick bid:</p>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_BID_INCREMENTS.map((increment) => (
                                <button
                                    key={increment}
                                    onClick={() => handleQuickBid(increment)}
                                    className="px-4 py-2 bg-[#2d1f40] hover:bg-[#3d2a54] rounded-md font-semibold text-gray-300 transition-colors border border-[#3d2a54]"
                                >
                                    +${increment}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom amount input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Your bid amount:
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                                $
                            </span>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={bidAmount}
                                onChange={(e) => handleInputChange(e.target.value)}
                                className={`w-full pl-8 pr-4 py-3 text-xl font-mono font-bold rounded-md transition-colors focus:outline-none bg-[#0f0a1a] text-white ${error
                                        ? 'border-2 border-red-500 focus:border-red-500'
                                        : 'border border-[#3d2a54] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                                    }`}
                                placeholder={minBid.toFixed(2)}
                            />
                        </div>
                        {error && <p className="mt-2 text-sm text-red-400 font-medium">{error}</p>}
                    </div>

                    {/* Continue button */}
                    <Button onClick={handleContinue} className="w-full" disabled={!bidAmount}>
                        Continue to Review
                    </Button>
                </div>
            )}

            {step === 'confirm' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="text-6xl mb-4">⚡️</div>
                        <h3 className="text-xl font-bold text-white mb-2">Confirm Your Bid</h3>
                        <p className="text-gray-400">You are about to place a bid on:</p>
                    </div>

                    <div className="p-4 bg-[#0f0a1a] rounded-lg border border-[#3d2a54] text-center">
                        <p className="font-bold text-white mb-2">{auction.title}</p>
                        <p className="text-3xl font-mono font-black text-purple-400">
                            {formatCurrency(parsedBidAmount)}
                        </p>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm text-yellow-400">
                            ⚠️ By confirming, you agree to pay this amount if you win the auction.
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-sm text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={handleBack} className="flex-1" disabled={isSubmitting}>
                            Back
                        </Button>
                        <Button onClick={handleSubmitBid} className="flex-1" isLoading={isSubmitting}>
                            {isSubmitting ? 'Placing Bid...' : 'Confirm Bid'}
                        </Button>
                    </div>
                </div>
            )}

            {step === 'success' && (
                <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Bid Placed! 🎉</h3>
                    <p className="text-gray-400 mb-4">
                        Your bid of <span className="font-bold text-purple-400">{formatCurrency(parsedBidAmount)}</span> has been placed.
                    </p>
                    <p className="text-sm text-gray-500">
                        You'll be notified if you're outbid.
                    </p>
                </div>
            )}
        </Modal>
    )
}
