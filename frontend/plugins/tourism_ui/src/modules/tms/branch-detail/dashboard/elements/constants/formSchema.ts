import { z } from 'zod';

export const ElementTranslationSchema = z.object({
  language: z.string(),
  name: z.string().optional(),
  note: z.string().optional(),
  cost: z.coerce.number().optional(),
});

export const ElementCreateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  note: z.string().optional(),
  startTime: z.string().optional(),
  duration: z.coerce.number().optional(),
  cost: z.coerce.number().optional(),
  categories: z.array(z.string()).optional(),
  quick: z.boolean().optional(),
  translations: z.array(ElementTranslationSchema).optional(),
});

export type ElementCreateFormType = z.infer<typeof ElementCreateFormSchema>;
