import { z } from 'zod';

const DayItemSchema = z.object({
  day: z.coerce.number().optional(),
  title: z.string().min(1, 'Day title is required'),
  description: z.string().optional(),
  elements: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export const ItineraryCreateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  duration: z.coerce.number().optional(),
  color: z.string().optional(),
  groupDays: z.array(DayItemSchema).optional(),
  totalCost: z.coerce.number().optional(),
  guideCost: z.coerce.number().optional(),
  driverCost: z.coerce.number().optional(),
  foodCost: z.coerce.number().optional(),
  gasCost: z.coerce.number().optional(),
  personCost: z.record(z.coerce.number()).optional(),
  guideCostExtra: z.coerce.number().optional(),
});

export type ItineraryCreateFormType = z.infer<typeof ItineraryCreateFormSchema>;
export type DayItemType = z.infer<typeof DayItemSchema>;
