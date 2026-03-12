import { z } from 'zod';

const DayItemSchema = z.object({
  day: z.coerce.number().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export const ItineraryCreateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  content: z.string().max(500).optional(),
  duration: z.coerce.number().optional(),
  color: z.string().optional(),
  groupDays: z.array(DayItemSchema).optional(),
  totalCost: z.coerce.number().optional(),
  images: z.array(z.string()).optional(),
});

export type ItineraryCreateFormType = z.infer<typeof ItineraryCreateFormSchema>;
