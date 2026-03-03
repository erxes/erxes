import { z } from 'zod';

export const loyaltyScoreFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  conditions: z.object({
    productCategoryIds: z.array(z.string()).optional(),
    productIds: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
    excludeProductCategoryIds: z.array(z.string()).optional(),
    excludeProductIds: z.array(z.string()).optional(),
    excludeTagIds: z.array(z.string()).optional(),
    serviceName: z.string().min(1, 'Service is required'),
  }),
});

export type LoyaltyScoreFormValues = z.infer<typeof loyaltyScoreFormSchema>;
