import { z } from 'zod';

const GuideSchema = z.object({
  guideId: z.string(),
  name: z.string().optional(),
});

export const TourCreateFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    refNumber: z.string().min(1, 'Ref number is required'),

    status: z.string().optional(),
    content: z.string().max(500).optional(),
    itineraryId: z.string().min(1, 'Itinerary is required'),
    categoryIds: z.array(z.string()).optional(),

    isFlexibleDate: z.boolean().default(false),
    startDate: z
      .union([z.coerce.date(), z.array(z.coerce.date()).max(5)])
      .optional(),
    endDate: z.coerce.date().optional(),
    availableFrom: z.coerce.date().optional(),
    availableTo: z.coerce.date().optional(),

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
  })
  .refine(
    (data) => {
      if (!data.isFlexibleDate) {
        return !!data.startDate && !!data.endDate;
      }
      return true;
    },
    {
      message: 'Start date and end date are required',
      path: ['startDate'],
    },
  )
  .refine(
    (data) => {
      if (data.isFlexibleDate) {
        return !!data.availableFrom && !!data.availableTo;
      }
      return true;
    },
    {
      message: 'Available date range is required for flexible dates',
      path: ['availableFrom'],
    },
  )
  .refine(
    (data) => {
      if (data.isFlexibleDate && data.availableFrom && data.availableTo) {
        return new Date(data.availableFrom) < new Date(data.availableTo);
      }
      return true;
    },
    {
      message: 'Available from must be before available to',
      path: ['availableTo'],
    },
  );

export type TourCreateFormType = z.infer<typeof TourCreateFormSchema>;
