import { z } from 'zod'

export const createAuctionSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title must be less than 100 characters'),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be less than 500 characters'),
    imageUrl: z.string()
        .url('Must be a valid URL')
        .optional()
        .or(z.literal('')),
    startPrice: z.number()
        .min(1, 'Starting price must be at least $1')
        .positive('Price must be positive'),
    endsAt: z.date()
        .refine((date) => date > new Date(), 'End date must be in the future'),
})

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>
