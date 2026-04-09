import { z } from 'zod';

const AmenityTranslationSchema = z.object({
  language: z.string(),
  name: z.string().optional(),
});

export const AmenityCreateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().optional(),
  quick: z.boolean().optional(),
  translations: z.array(AmenityTranslationSchema).optional(),
});

export type AmenityCreateFormType = z.infer<typeof AmenityCreateFormSchema>;
