import { z } from 'zod';

export const CategoryCreateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  parentId: z.string().optional(),
  attachment: z
    .object({
      url: z.string().optional(),
      name: z.string().optional(),
      type: z.string().optional(),
      size: z.number().optional(),
      duration: z.number().optional(),
    })
    .optional(),
});

export type CategoryCreateFormType = z.infer<typeof CategoryCreateFormSchema>;
