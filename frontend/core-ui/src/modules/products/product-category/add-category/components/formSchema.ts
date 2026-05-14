import { z } from 'zod';

const similarityItemSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  groupId: z.string().optional(),
  fieldId: z.string().optional(),
});

export const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  parentId: z.string().optional(),
  description: z.string().optional(),
  attachment: z.any().optional(),
  maskType: z.string().optional(),
  status: z.string().optional(),
  meta: z.string().optional(),
  scopeBrandIds: z.array(z.string()).optional(),
  isSimilarity: z.boolean().optional(),
  similarities: z.array(similarityItemSchema).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
