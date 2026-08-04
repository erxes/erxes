import { z } from 'zod';

export const adjustFixedAssetSchema = z.object({
  date: z.date(),
  description: z.string().optional(),
});

export type TAdjustFixedAssetForm = z.infer<typeof adjustFixedAssetSchema>;
