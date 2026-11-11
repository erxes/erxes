import { z } from 'zod';

export const adjustFixedAssetSchema = z.object({
  date: z.date(),
  taxRate: z.number().finite().min(0).max(100),
  description: z.string().optional(),
});

export type TAdjustFixedAssetForm = z.infer<typeof adjustFixedAssetSchema>;
