import { z } from 'zod';

const stringArrayField = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}, z.array(z.string()));

export const productRulesOnTaxSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  productCategoryIds: stringArrayField,
  taxType: z.string().min(1, 'Select a tax type'),
  excludeCategoryIds: stringArrayField,
  taxCode: z.string(),
  productIds: stringArrayField,
  excludeProductIds: stringArrayField,
  kind: z.string().min(1, 'Select a kind'),
  taxPercent: z.number(),
  tagIds: stringArrayField,
  excludeTagIds: stringArrayField,
  status: z.string().optional(),
});

export type TProductRulesOnTaxForm = z.infer<typeof productRulesOnTaxSchema>;
