import { z } from 'zod';

export const AmenityCreateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().optional(),
  quick: z.boolean().optional(),
});

export type AmenityCreateFormType = z.infer<typeof AmenityCreateFormSchema>;
