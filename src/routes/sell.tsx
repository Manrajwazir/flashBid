import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { useSession } from '../lib/auth-client'
import { createAuction } from '../server/functions'
import { analyzeProductImage } from '../server/ai-functions'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export const Route = createFileRoute('/sell')({
    component: SellPage,
})

function SellPage() {
    const { data: session, isPending } = useSession()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        startPrice: '',
        endsAt: '',
    })

    // Image states
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageBase64, setImageBase64] = useState<string | null>(null)
    const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg')

    const [errors, setErrors] = useState<any>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [createdAuction, setCreatedAuction] = useState<any>(null)

    // AI states
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [aiGenerated, setAiGenerated] = useState<{ title: boolean; description: boolean; price: boolean }>({
        title: false,
        description: false,
        price: false,
    })
    const [aiError, setAiError] = useState<string | null>(null)

    // Redirect if not logged in
    if (!isPending && !session?.user) {
        window.location.href = `/login?redirect=${encodeURIComponent('/sell')}`
        return null
    }

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#58a6ff] border-t-transparent"></div>
            </div>
        )
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setAiError('Please upload an image file')
            return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setAiError('Image must be less than 10MB')
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string
            setImagePreview(dataUrl)
            // Extract base64 data and mime type
            const [header, base64Data] = dataUrl.split(',')
            const mimeMatch = header.match(/data:(.*?);/)
            if (mimeMatch) {
                setImageMimeType(mimeMatch[1])
            }
            setImageBase64(base64Data)
            // Also set as form data imageUrl (data URL)
            setFormData(prev => ({ ...prev, imageUrl: dataUrl }))
            setAiError(null)
        }
        reader.onerror = () => {
            setAiError('Failed to read image file')
        }
        reader.readAsDataURL(file)
    }

    const handleAIAnalyze = async () => {
        if (!imageBase64 && !formData.imageUrl) {
            setAiError('Please upload an image first')
            return
        }

        setIsAnalyzing(true)
        setAiError(null)

        try {
            const result = await analyzeProductImage({
                data: {
                    imageUrl: formData.imageUrl,
                    imageBase64: imageBase64 || undefined,
                    mimeType: imageMimeType,
                }
            } as any)

            if (result.success && result.data) {
                setFormData(prev => ({
                    ...prev,
                    title: result.data.title,
                    description: result.data.description,
                    startPrice: result.data.suggestedPrice.toString(),
                }))
                setAiGenerated({ title: true, description: true, price: true })
            } else {
                setAiError(result.error || 'Failed to analyze image')
            }
        } catch (error: any) {
            console.error('AI analysis error:', error)
            setAiError(error.message || 'Failed to analyze image')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})
        setIsSubmitting(true)

        try {
            // Prepare data for validation
            const dataToSubmit = {
                title: formData.title,
                description: formData.description,
                imageUrl: formData.imageUrl,
                startPrice: parseFloat(formData.startPrice),
                endsAt: new Date(formData.endsAt),
            }

            const auction = await createAuction({ data: { ...dataToSubmit, userId: session?.user?.id } } as any)

            // Success!
            setCreatedAuction(auction)
            setShowSuccess(true)
            setFormData({ title: '', description: '', imageUrl: '', startPrice: '', endsAt: '' })
            setAiGenerated({ title: false, description: false, price: false })
        } catch (error: any) {
            console.error('Error creating auction:', error)

            // Try to parse error if it's a string containing JSON
            let errorData = error
            if (typeof error.message === 'string') {
                try {
                    const parsed = JSON.parse(error.message)
                    if (Array.isArray(parsed)) {
                        errorData = { issues: parsed }
                    }
                } catch {
                    // Not JSON, use as-is
                }
            }

            if (errorData.issues) {
                // Zod validation errors - show friendly field messages
                const fieldErrors: any = {}
                errorData.issues.forEach((issue: any) => {
                    fieldErrors[issue.path[0]] = issue.message
                })
                setErrors(fieldErrors)
            } else {
                setErrors({ general: error.message || 'Failed to create auction' })
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (showSuccess && createdAuction) {
        return (
            <div className="min-h-screen bg-[#0d1117] py-12 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">Auction Created! 🎉</h1>
                        <p className="text-gray-400">Your auction is now live and ready for bids</p>
                    </div>

                    {createdAuction.imageUrl && (
                        <img
                            src={createdAuction.imageUrl}
                            alt={createdAuction.title}
                            className="w-full max-w-md mx-auto rounded-md shadow-lg mb-6 border border-[#30363d]"
                        />
                    )}

                    <div className="bg-[#161b22] rounded-md p-6 shadow-lg mb-6 border border-[#30363d]">
                        <h2 className="text-xl font-semibold text-[#e6edf3] mb-2">{createdAuction.title}</h2>
                        <p className="text-[#8b949e] mb-4">{createdAuction.description}</p>
                        <p className="text-lg font-mono font-semibold text-[#3fb950]">
                            Starting at ${createdAuction.startPrice.toFixed(2)}
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => window.location.href = '/'}>
                            View All Auctions
                        </Button>
                        <Button variant="secondary" onClick={() => setShowSuccess(false)}>
                            Create Another
                        </Button>
                        <Button variant="secondary" onClick={() => window.location.href = '/dashboard'}>
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0d1117] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-[#e6edf3] mb-1">Create an Auction</h1>
                    <p className="text-[#8b949e] text-sm">List your item and start receiving bids</p>
                </div>

                {errors.general && (
                    <div className="mb-4 p-3 bg-[#f85149]/10 border border-[#f85149]/30 rounded-md">
                        <p className="text-[#f85149] text-sm">{errors.general}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-[#161b22] rounded-md p-6 space-y-5 border border-[#30363d]">
                    <div>
                        <label className="block text-sm font-medium text-[#c9d1d9] mb-2">
                            Product Image
                        </label>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {!imagePreview ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border border-dashed border-[#30363d] hover:border-[#58a6ff] rounded-md p-8 text-center cursor-pointer transition-colors bg-[#0d1117]"
                            >
                                <div className="text-3xl mb-2">📷</div>
                                <p className="text-[#e6edf3] font-medium text-sm mb-1">Click to upload image</p>
                                <p className="text-[#6e7681] text-xs">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        ) : (
                            /* Image preview with actions */
                            <div className="space-y-4">
                                <div className="relative group">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full max-h-64 object-contain rounded-md border border-[#30363d]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null)
                                            setImageBase64(null)
                                            setFormData(prev => ({ ...prev, imageUrl: '' }))
                                            if (fileInputRef.current) fileInputRef.current.value = ''
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-[#da3633] hover:bg-[#f85149] text-white rounded-md opacity-0 group-hover:opacity-100 transition-all text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 px-3 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-md border border-[#30363d] text-sm transition-colors"
                                    >
                                        📷 Change
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAIAnalyze}
                                        disabled={isAnalyzing}
                                        className="flex-1 px-3 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:bg-[#21262d] disabled:text-[#8b949e] disabled:cursor-not-allowed"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                <span>Analyzing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>✨</span>
                                                <span>AI Auto-Fill</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {errors.imageUrl && (
                            <p className="mt-2 text-sm text-red-400 font-medium">{errors.imageUrl}</p>
                        )}
                        {aiError && (
                            <p className="mt-2 text-sm text-orange-400 font-medium">⚠️ {aiError}</p>
                        )}
                    </div>

                    {/* Title with AI badge */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block text-sm font-medium text-[#c9d1d9]">
                                Title *
                            </label>
                            {aiGenerated.title && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-[#238636]/20 text-[#3fb950] rounded-full">
                                    ✨ AI
                                </span>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="e.g., Vintage Guitar"
                            value={formData.title}
                            onChange={(e) => {
                                setFormData({ ...formData, title: e.target.value })
                                if (aiGenerated.title) setAiGenerated(prev => ({ ...prev, title: false }))
                            }}
                            className={`w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none ${errors.title
                                ? 'border-[#f85149] bg-[#f85149]/10 text-[#e6edf3]'
                                : aiGenerated.title
                                    ? 'border-[#3fb950]/50 bg-[#3fb950]/10 text-[#e6edf3]'
                                    : 'border-[#30363d] bg-[#0d1117] focus:border-[#58a6ff] text-[#e6edf3] placeholder-[#6e7681]'
                                }`}
                        />
                        {errors.title && (
                            <p className="mt-2 text-sm text-red-400 font-medium">{errors.title}</p>
                        )}
                        <p className="mt-2 text-sm text-gray-500">5-100 characters</p>
                    </div>

                    {/* Description with AI badge */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block text-sm font-medium text-[#c9d1d9]">
                                Description *
                            </label>
                            {aiGenerated.description && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-[#238636]/20 text-[#3fb950] rounded-full">
                                    ✨ AI
                                </span>
                            )}
                        </div>
                        <textarea
                            placeholder="Describe your item in detail..."
                            value={formData.description}
                            onChange={(e) => {
                                setFormData({ ...formData, description: e.target.value })
                                if (aiGenerated.description) setAiGenerated(prev => ({ ...prev, description: false }))
                            }}
                            rows={4}
                            className={`w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none resize-none ${errors.description
                                ? 'border-[#f85149] bg-[#f85149]/10 text-[#e6edf3]'
                                : aiGenerated.description
                                    ? 'border-[#3fb950]/50 bg-[#3fb950]/10 text-[#e6edf3]'
                                    : 'border-[#30363d] bg-[#0d1117] focus:border-[#58a6ff] text-[#e6edf3] placeholder-[#6e7681]'
                                }`}
                        />
                        {errors.description && (
                            <p className="mt-2 text-sm text-red-400 font-medium">{errors.description}</p>
                        )}
                        <p className="mt-2 text-sm text-gray-500">10-500 characters</p>
                    </div>

                    {/* Starting Price with AI badge */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block text-sm font-medium text-[#c9d1d9]">
                                Starting Price *
                            </label>
                            {aiGenerated.price && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-[#238636]/20 text-[#3fb950] rounded-full">
                                    ✨ AI
                                </span>
                            )}
                        </div>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={formData.startPrice}
                            onChange={(e) => {
                                setFormData({ ...formData, startPrice: e.target.value })
                                if (aiGenerated.price) setAiGenerated(prev => ({ ...prev, price: false }))
                            }}
                            step="0.01"
                            min="1"
                            className={`w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none ${errors.startPrice
                                ? 'border-[#f85149] bg-[#f85149]/10 text-[#e6edf3]'
                                : aiGenerated.price
                                    ? 'border-[#3fb950]/50 bg-[#3fb950]/10 text-[#e6edf3]'
                                    : 'border-[#30363d] bg-[#0d1117] focus:border-[#58a6ff] text-[#e6edf3] placeholder-[#6e7681]'
                                }`}
                        />
                        {errors.startPrice && (
                            <p className="mt-2 text-sm text-red-400 font-medium">{errors.startPrice}</p>
                        )}
                        <p className="mt-2 text-sm text-gray-500">Minimum $1</p>
                    </div>

                    <Input
                        label="End Date *"
                        value={formData.endsAt}
                        onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                        error={errors.endsAt}
                        type="datetime-local"
                        helperText="When the auction should end"
                    />

                    <div className="pt-4 border-t border-[#30363d]">
                        <Button
                            type="submit"
                            variant="green"
                            className="w-full"
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating Auction...' : 'Create Auction'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

