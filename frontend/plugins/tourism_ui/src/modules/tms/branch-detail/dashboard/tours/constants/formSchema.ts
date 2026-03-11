import { z } from 'zod';

const GuideSchema = z.object({
  guideId: z.string(),
  name: z.string().optional(),
});

export const TourCreateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  refNumber: z.string().min(1, 'Ref number is required'),

  status: z.string().optional(),
  content: z.string().max(500).optional(),
  itineraryId: z.string().optional(),

  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),

  groupSize: z.coerce.number().optional(),
  duration: z.coerce.number().optional(),
  cost: z.coerce.number().optional(),

  guides: z.array(GuideSchema).optional(),

  info1: z.string().optional(),
  info2: z.string().optional(),
  info3: z.string().optional(),
  info4: z.string().optional(),
  info5: z.string().optional(),

  images: z.array(z.string()).optional(),
  imageThumbnail: z.string().optional(),

  advancePercent: z.coerce.number().optional(),
  advanceCheck: z.boolean().optional(),
  joinPercent: z.coerce.number().optional(),

  personCost: z.record(z.any()).optional(),
});

export type TourCreateFormType = z.infer<typeof TourCreateFormSchema>;
