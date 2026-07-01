import { z } from 'zod';

export const bulkPropertySchema = z.object({
  fieldId: z.string(),
  values: z.array(z.string()),
});

export const bulkRowSchema = z.object({
  key: z.string(),
  productId: z.string().optional(),
  combination: z.record(z.string(), z.string()),
  code: z.string(),
  codeEdited: z.boolean().default(false),
  name: z.string().default(''),
  nameEdited: z.boolean().default(false),
  unitPrice: z.coerce.number().optional(),
  isExcluded: z.boolean(),
  isStar: z.boolean(),
});

export const bulkSimilaritySchema = z
  .object({
    name: z.string().min(1, { message: 'Product name is required' }),
    code: z.string().min(1, { message: 'Product code is required' }),
    categoryId: z.string().min(1, { message: 'Category is required' }),
    shortName: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    unitPrice: z.coerce.number().min(0, {
      message: 'Unit price must be greater than or equal to 0',
    }),
    currency: z.string().optional(),
    uom: z.string().min(1, { message: 'UOM is required' }),
    vendorId: z.string().optional(),
    scopeBrandIds: z.array(z.string()).optional().catch([]),
    barcodeDescription: z.string().optional(),
    attachment: z.any().optional(),
    attachmentMore: z.any().optional(),
    properties: z.array(bulkPropertySchema),
    rows: z.array(bulkRowSchema),
  })
  .superRefine(({ rows }, ctx) => {
    const codeCounts = new Map<string, number>();
    for (const row of rows) {
      if (row.isExcluded) continue;
      codeCounts.set(row.code, (codeCounts.get(row.code) || 0) + 1);
    }

    rows.forEach((row, index) => {
      if (!row.isExcluded && (codeCounts.get(row.code) || 0) > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate code',
          path: ['rows', index, 'code'],
        });
      }
    });
  });

export type BulkSimilarityFormValues = z.infer<typeof bulkSimilaritySchema>;
export type BulkPropertyFormValue = z.infer<typeof bulkPropertySchema>;
export type BulkRowFormValue = z.infer<typeof bulkRowSchema>;
