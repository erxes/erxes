import { z } from 'zod';
import { EBarimtStatus } from './ebarimtDefaultValues';

export const ebarimtFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  productCategories: z.string().min(1, 'Select a product category'),
  taxType: z.string().min(1, 'Select a tax type'),
  excludeCategories: z.string().optional(),
  taxCode: z.string().min(1, 'Select a tax code'),
  products: z.string().min(1, 'Select products'),
  excludeProducts: z.string().optional(),
  kind: z.number().min(0).max(100),
  percent: z.number().min(0).max(100),
  tags: z.string().optional(),
  excludeTags: z.string().optional(),
  status: z.nativeEnum(EBarimtStatus).default(EBarimtStatus.ACTIVE),
});

export type TEBarimtForm = z.infer<typeof ebarimtFormSchema>;
