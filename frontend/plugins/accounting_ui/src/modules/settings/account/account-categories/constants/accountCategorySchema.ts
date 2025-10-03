import { z } from 'zod';

export const accountCategorySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  parentId: z.string().optional(),
  description: z.string().optional(),
});
