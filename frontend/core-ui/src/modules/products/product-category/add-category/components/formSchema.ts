import { z } from 'zod';

export const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  attachment: z.any().optional(),
  accountMaskType: z.string().optional(),
  state: z.string().optional(),
  meta: z.string().optional(),
  scopeBrandIds: z.array(z.string()).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
