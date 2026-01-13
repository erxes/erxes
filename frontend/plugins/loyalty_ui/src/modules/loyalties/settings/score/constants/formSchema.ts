import { z } from 'zod';

export const loyaltyScoreFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  productCategory: z.array(z.string()).optional(),
  product: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  orExcludeProductCategory: z.array(z.string()).optional(),
  orExcludeProduct: z.array(z.string()).optional(),
  orExcludeTag: z.array(z.string()).optional(),
});

export type LoyaltyScoreFormValues = z.infer<typeof loyaltyScoreFormSchema>;
