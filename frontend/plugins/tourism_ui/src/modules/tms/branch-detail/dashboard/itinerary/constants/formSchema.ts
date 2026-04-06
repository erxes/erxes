import { z } from 'zod';

const OptionalNumberSchema = z.preprocess((value) => {
  if (value === '' || value === null || typeof value === 'undefined') {
    return undefined;
  }

  const parsed =
    typeof value === 'number' ? value : Number(String(value).trim());

  return Number.isNaN(parsed) ? undefined : parsed;
}, z.number().optional());

const DayItemSchema = z.object({
  day: OptionalNumberSchema,
  title: z.string().min(1, 'Day title is required'),
  description: z.string().optional(),
  elements: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

const GroupDayTranslationSchema = z.object({
  day: z.number(),
  title: z.string().optional(),
  content: z.string().optional(),
});

export const ItineraryTranslationSchema = z.object({
  language: z.string(),
  name: z.string().optional(),
  content: z.string().optional(),
  foodCost: z.coerce.number().optional(),
  gasCost: z.coerce.number().optional(),
  driverCost: z.coerce.number().optional(),
  guideCost: z.coerce.number().optional(),
  guideCostExtra: z.coerce.number().optional(),
  groupDays: z.array(GroupDayTranslationSchema).optional(),
});

export const ItineraryCreateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  duration: OptionalNumberSchema,
  groupDays: z.array(DayItemSchema).optional(),
  totalCost: OptionalNumberSchema,
  guideCost: OptionalNumberSchema,
  driverCost: OptionalNumberSchema,
  foodCost: OptionalNumberSchema,
  gasCost: OptionalNumberSchema,
  personCost: z.record(OptionalNumberSchema).optional(),
  guideCostExtra: OptionalNumberSchema,
  images: z.array(z.string()).optional(),
  content: z.string().optional(),
  color: z.string().optional(),
  translations: z.array(ItineraryTranslationSchema).optional(),
});

export type ItineraryCreateFormType = z.infer<typeof ItineraryCreateFormSchema>;
export type DayItemType = z.infer<typeof DayItemSchema>;
