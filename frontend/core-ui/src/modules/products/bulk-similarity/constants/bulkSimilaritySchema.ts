import { z } from 'zod';

export const bulkSimilaritySchema = z.object({
  name: z.string().min(1, { message: 'Product name is required' }),
  baseCode: z.string().min(1, { message: 'Product code is required' }),
  categoryId: z.string().min(1, { message: 'Category is required' }),
  shortName: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  unitPrice: z.coerce.number().min(0, {
    message: 'Unit price must be greater than or equal to 0',
  }),
  currency: z.string().optional(),
  uom: z.string().optional(),
  vendorId: z.string().optional(),
  scopeBrandIds: z.array(z.string()).optional().catch([]),
  barcodeDescription: z.string().optional(),
  attachment: z.any().optional(),
  attachmentMore: z.any().optional(),
});

export type BulkSimilarityFormValues = z.infer<typeof bulkSimilaritySchema>;
