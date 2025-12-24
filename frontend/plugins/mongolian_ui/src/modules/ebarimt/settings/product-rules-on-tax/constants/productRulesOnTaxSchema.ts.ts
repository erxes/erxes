import { z } from 'zod';

export const productRulesOnTaxSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  productCategories: z.string().optional(),
  taxType: z.string().min(1, 'Select a tax type'),
  excludeCategories: z.string().optional(),
  taxCode: z.string().min(1, 'Select a tax code'),
  products: z.string().optional(),
  excludeProducts: z.string().optional(),
  kind: z.string().min(1, 'Select a kind'),
  percent: z.number().min(0, 'Percent must be at least 0'),
  tags: z.string().optional(),
  excludeTags: z.string().optional(),
  status: z.string().optional(),
});

export type TProductRulesOnTaxForm = z.infer<typeof productRulesOnTaxSchema>;
