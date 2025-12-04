import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useSession } from '../lib/auth-client'
import { createAuction } from '../server/functions'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export const Route = createFileRoute('/sell')({
    component: SellPage,
})

function SellPage() {
    const { data: session, isPending } = useSession()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        startPrice: '',
        endsAt: '',
    })

    const [errors, setErrors] = useState<any>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [createdAuction, setCreatedAuction] = useState<any>(null)

    // Redirect if not logged in
    if (!isPending && !session?.user) {
        window.location.href = `/login?redirect=${encodeURIComponent('/sell')}`
        return null
    }

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
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
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Auction Created! 🎉</h1>
                        <p className="text-gray-600">Your auction is now live and ready for bids</p>
                    </div>

                    {createdAuction.imageUrl && (
                        <img
                            src={createdAuction.imageUrl}
                            alt={createdAuction.title}
                            className="w-full max-w-md mx-auto rounded-2xl shadow-lg mb-6"
                        />
                    )}

                    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{createdAuction.title}</h2>
                        <p className="text-gray-600 mb-4">{createdAuction.description}</p>
                        <p className="text-xl font-mono font-black text-green-600">
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
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Create an Auction</h1>
                    <p className="text-gray-600">List your item and start receiving bids</p>
                </div>

                {errors.general && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                        <p className="text-red-700 font-semibold">{errors.general}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                    <Input
                        label="Title *"
                        placeholder="e.g., Vintage Guitar"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        error={errors.title}
                        helperText="5-100 characters"
                    />

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            placeholder="Describe your item in detail..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                        />
                        {errors.description && (
                            <p className="mt-2 text-sm text-red-600 font-medium">{errors.description}</p>
                        )}
                        <p className="mt-2 text-sm text-gray-500">10-500 characters</p>
                    </div>

                    <Input
                        label="Image URL (optional)"
                        placeholder="https://example.com/image.jpg"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        error={errors.imageUrl}
                        type="url"
                    />

                    {formData.imageUrl && (
                        <div className="mt-4">
                            <p className="text-sm font-bold text-gray-700 mb-2">Image Preview:</p>
                            <img
                                src={formData.imageUrl}
                                alt="Preview"
                                className="w-full max-w-sm rounded-xl shadow-md"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                }}
                            />
                        </div>
                    )}

                    <Input
                        label="Starting Price *"
                        placeholder="0.00"
                        value={formData.startPrice}
                        onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
                        error={errors.startPrice}
                        type="number"
                        step="0.01"
                        min="1"
                        helperText="Minimum $1"
                    />

                    <Input
                        label="End Date *"
                        value={formData.endsAt}
                        onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                        error={errors.endsAt}
                        type="datetime-local"
                        helperText="When the auction should end"
                    />

                    <div className="pt-4 border-t border-gray-200">
                        <Button
                            type="submit"
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
