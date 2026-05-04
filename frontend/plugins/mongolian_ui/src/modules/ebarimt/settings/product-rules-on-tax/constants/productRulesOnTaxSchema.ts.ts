import { z } from 'zod';

export const productRulesOnTaxSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  productCategoryIds: z.string().optional(),
  taxType: z.string().min(1, 'Select a tax type'),
  excludeCategoryIds: z.string().optional(),
  taxCode: z.string().min(1, 'Select a tax code'),
  productIds: z.string().optional(),
  excludeProductIds: z.string().optional(),
  kind: z.string().min(1, 'Select a kind'),
  percent: z.number().min(0, 'Percent must be at least 0'),
  tagIds: z.string().optional(),
  excludeTagIds: z.string().optional(),
  status: z.string().optional(),
});

export type TProductRulesOnTaxForm = z.infer<typeof productRulesOnTaxSchema>;
