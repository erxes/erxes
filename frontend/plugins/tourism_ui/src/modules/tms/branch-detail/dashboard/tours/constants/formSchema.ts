import { z } from 'zod';

export const TourCreateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
});

export type TourCreateFormType = z.infer<typeof TourCreateFormSchema>;
