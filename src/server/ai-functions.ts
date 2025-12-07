import { createServerFn } from '@tanstack/react-start'
import OpenAI from 'openai'

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
})

// Analyze product image and generate listing details
export const analyzeProductImage = createServerFn({ method: 'POST' })
    .handler(async (ctx) => {
        const data = (ctx as any).data as {
            imageUrl?: string
            imageBase64?: string
            mimeType?: string
        }

        if (!process.env.OPENAI_API_KEY) {
            return { success: false, error: 'AI service not configured. Add OPENAI_API_KEY to .env' }
        }

        if (!data.imageUrl && !data.imageBase64) {
            return { success: false, error: 'Image is required' }
        }

        try {
            let imageContent: OpenAI.Chat.Completions.ChatCompletionContentPartImage

            // If it's a data URL or base64, use it directly
            if (data.imageUrl?.startsWith('data:') || data.imageBase64) {
                const dataUrl = data.imageUrl?.startsWith('data:')
                    ? data.imageUrl
                    : `data:${data.mimeType || 'image/jpeg'};base64,${data.imageBase64}`
                imageContent = {
                    type: 'image_url',
                    image_url: { url: dataUrl }
                }
            } else if (data.imageUrl) {
                imageContent = {
                    type: 'image_url',
                    image_url: { url: data.imageUrl }
                }
            } else {
                return { success: false, error: 'No valid image provided' }
            }

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `You are an expert auction listing assistant. Analyze this product image and provide details for creating an auction listing.

Return a JSON object with these exact fields:
{
  "title": "A compelling, concise title for the product (max 60 chars)",
  "description": "A detailed, engaging description highlighting features, condition, and appeal (100-300 chars)",
  "category": "One of: Electronics, Fashion, Home, Sports, Collectibles, Art, Vehicles, Other",
  "suggestedPrice": A realistic starting price in USD as a number (no $ sign),
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "condition": "One of: New, Like New, Good, Fair, For Parts"
}

Be specific and accurate based on what you see in the image. Only return valid JSON, no markdown or explanation.`
                            },
                            imageContent
                        ]
                    }
                ],
                max_tokens: 500,
            })

            const responseText = response.choices[0]?.message?.content || ''

            // Parse the JSON response
            let parsed
            try {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0])
                } else {
                    throw new Error('No JSON found in response')
                }
            } catch (parseError) {
                console.error('Failed to parse AI response:', responseText)
                return { success: false, error: 'AI returned invalid response' }
            }

            return {
                success: true,
                data: {
                    title: parsed.title || 'Product',
                    description: parsed.description || 'A great item for auction',
                    category: parsed.category || 'Other',
                    suggestedPrice: typeof parsed.suggestedPrice === 'number' ? parsed.suggestedPrice : 25,
                    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
                    condition: parsed.condition || 'Good',
                },
            }
        } catch (error: any) {
            console.error('AI analysis error:', error)
            return { success: false, error: error.message || 'Failed to analyze image' }
        }
    })

// Predict auction outcome based on current data
export const predictAuctionOutcome = createServerFn({ method: 'POST' })
    .handler(async (ctx) => {
        const data = (ctx as any).data as {
            title: string
            description: string
            currentPrice: number
            startPrice: number
            bidCount: number
            timeRemainingMs: number
            category?: string
        }

        if (!process.env.OPENAI_API_KEY) {
            return { success: false, error: 'AI service not configured. Add OPENAI_API_KEY to .env' }
        }

        try {
            const hoursRemaining = Math.max(0, data.timeRemainingMs / (1000 * 60 * 60))
            const priceIncrease = data.currentPrice - data.startPrice
            const priceIncreasePercent = data.startPrice > 0 ? (priceIncrease / data.startPrice) * 100 : 0

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: `You are an auction analytics expert. Analyze this auction and predict the outcome.

AUCTION DATA:
- Title: ${data.title}
- Description: ${data.description}
- Starting Price: $${data.startPrice}
- Current Price: $${data.currentPrice}
- Number of Bids: ${data.bidCount}
- Price Increase: ${priceIncreasePercent.toFixed(1)}%
- Time Remaining: ${hoursRemaining.toFixed(1)} hours
- Category: ${data.category || 'Unknown'}

Return a JSON object with these exact fields:
{
  "predictedMinPrice": Realistic minimum final price as a number,
  "predictedMaxPrice": Realistic maximum final price as a number,
  "confidence": "High", "Medium", or "Low",
  "analysis": "Brief 1-2 sentence analysis of the auction momentum",
  "suggestedBid": Suggested bid amount to win as a number,
  "bidAdvice": "Brief advice for bidders (1 sentence)"
}

Consider:
- Auctions often see most activity in final hours
- More bids = more interest = higher final price
- Items with good descriptions sell for more
- Be realistic based on the item type

Only return valid JSON, no markdown or explanation.`
                    }
                ],
                max_tokens: 300,
            })

            const responseText = response.choices[0]?.message?.content || ''

            // Parse the JSON response
            let parsed
            try {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0])
                } else {
                    throw new Error('No JSON found in response')
                }
            } catch (parseError) {
                console.error('Failed to parse AI response:', responseText)
                return { success: false, error: 'AI returned invalid response' }
            }

            return {
                success: true,
                data: {
                    predictedMinPrice: typeof parsed.predictedMinPrice === 'number' ? parsed.predictedMinPrice : data.currentPrice,
                    predictedMaxPrice: typeof parsed.predictedMaxPrice === 'number' ? parsed.predictedMaxPrice : data.currentPrice * 1.2,
                    confidence: ['High', 'Medium', 'Low'].includes(parsed.confidence) ? parsed.confidence : 'Medium',
                    analysis: parsed.analysis || 'Analysis unavailable',
                    suggestedBid: typeof parsed.suggestedBid === 'number' ? parsed.suggestedBid : data.currentPrice + 5,
                    bidAdvice: parsed.bidAdvice || 'Place your bid soon!',
                },
            }
        } catch (error: any) {
            console.error('AI prediction error:', error)
            return { success: false, error: error.message || 'Failed to predict auction' }
        }
    })

// Generate auctioneer commentary for auction events
export const generateAuctioneerCommentary = createServerFn({ method: 'POST' })
    .handler(async (ctx) => {
        const data = (ctx as any).data as {
            event: 'bid' | 'time' | 'hype' | 'end'
            auctionTitle?: string
            currentPrice?: number
            priceIncrease?: string
            bidCount?: number
            lastBidderName?: string
            timeRemaining?: string
        }

        if (!process.env.OPENAI_API_KEY) {
            return { success: false, error: 'AI service not configured' }
        }

        try {
            let prompt = ''

            switch (data.event) {
                case 'bid':
                    prompt = `You are an enthusiastic live auction announcer. Generate ONE short, exciting sentence (max 100 chars) announcing a new bid. Facts: Item is "${data.auctionTitle}", new price is $${data.currentPrice}, this is bid #${data.bidCount}, bidder name is "${data.lastBidderName}", price is up ${data.priceIncrease}% from start. Be energetic and create urgency! NO EMOJIS - this will be read aloud by text-to-speech.`
                    break
                case 'time':
                    prompt = `You are a live auction announcer. Generate ONE urgent sentence (max 80 chars) warning that only ${data.timeRemaining} remains! Item: "${data.auctionTitle}" at $${data.currentPrice}. Create urgency! Use "Going once, going twice" style if under 30 seconds. NO EMOJIS.`
                    break
                case 'end':
                    prompt = `You are a live auction announcer. Generate ONE celebratory sentence (max 80 chars) announcing the auction has ended and item is SOLD. Item: "${data.auctionTitle}" sold for $${data.currentPrice}. Be excited! NO EMOJIS.`
                    break
                default:
                    prompt = `You are a live auction announcer. Generate ONE exciting sentence (max 80 chars) about auction activity for "${data.auctionTitle}". NO EMOJIS.`
            }

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 60,
                temperature: 0.9,
            })

            const commentary = response.choices[0]?.message?.content?.trim() || ''

            return {
                success: true,
                commentary,
            }
        } catch (error: any) {
            console.error('Auctioneer error:', error)
            return { success: false, error: error.message || 'Failed to generate commentary' }
        }
    })

