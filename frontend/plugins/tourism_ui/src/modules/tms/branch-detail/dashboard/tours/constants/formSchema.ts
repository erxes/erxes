import { z } from 'zod';

const emptyStringOrNullToUndefined = (value: unknown) => {
  if (value === '' || value === null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return value;
};

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'string') {
      const num = Number(value);
      return Number.isNaN(num) ? undefined : num;
    }
    return value;
  }, schema.optional());

const optionalString = (schema: z.ZodString = z.string()) =>
  z.preprocess(emptyStringOrNullToUndefined, schema.optional());

/* ================= PRICING OPTION TRANSLATION ================= */

export const PricingOptionTranslationSchema = z.object({
  optionId: z.string(),
  title: z.string().optional(),
  accommodationType: z.string().optional(),
  note: z.string().optional(),
  pricePerPerson: optionalNumber(z.number()),
  domesticFlightPerPerson: optionalNumber(z.number()),
  singleSupplement: optionalNumber(z.number()),
});

/* ================= TOUR TRANSLATION ================= */

export const TourTranslationSchema = z.object({
  language: z.string(),
  name: z.string().optional(),
  refNumber: z.string().optional(),
  content: z.string().optional(),
  info1: z.string().optional(),
  info2: z.string().optional(),
  info3: z.string().optional(),
  info4: z.string().optional(),
  info5: z.string().optional(),
  pricingOptions: z.array(PricingOptionTranslationSchema).optional(),
});

/* ================= PRICING ================= */

export const PricingOptionSchema = z.object({
  _id: z.string(),

  title: z.string().trim().min(1, 'Title is required'),

  minPersons: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined)
        return undefined;
      if (typeof value === 'string') {
        const num = Number(value);
        return Number.isNaN(num) ? undefined : num;
      }
      return value;
    },
    z.coerce.number().min(1, 'Min persons must be at least 1'),
  ),

  maxPersons: optionalNumber(
    z.number().min(1, 'Max persons must be at least 1'),
  ),

  pricePerPerson: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined)
        return undefined;
      if (typeof value === 'string') {
        const num = Number(value);
        return Number.isNaN(num) ? undefined : num;
      }
      return value;
    },
    z.coerce.number().min(0.01, 'Price must be greater than 0'),
  ),

  accommodationType: optionalString(),

  domesticFlightPerPerson: optionalNumber(
    z.number().min(0, 'Domestic flight must be 0 or greater'),
  ),

  singleSupplement: optionalNumber(
    z.number().min(0, 'Single supplement must be 0 or greater'),
  ),

  note: optionalString(),
});

/* ================= GUIDE ================= */

const GuideSchema = z.object({
  guideId: z.string(),
  name: z.string().optional(),
});

/* ================= MAIN SCHEMA ================= */

export const TourCreateFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    refNumber: z.string().min(1, 'Ref number is required'),

    status: z.string().optional(),
    content: z.string().max(500).optional(),
    itineraryId: z.string().min(1, 'Itinerary is required'),
    categoryIds: z.array(z.string()).optional(),

    isFlexibleDate: z.boolean().default(false),
    isGroupTour: z.boolean().default(false),

    // START DATE (single OR multiple)
    startDate: z
      .union([
        z.coerce.date(),
        z
          .array(z.coerce.date())
          .min(1, 'Select at least one start date')
          .max(5, 'Max 5 dates allowed')
          .refine(
            (dates) => {
              const unique = new Set(dates.map((d) => d.toISOString()));
              return unique.size === dates.length;
            },
            { message: 'Duplicate dates are not allowed' },
          ),
      ])
      .optional(),

    endDate: z.coerce.date().optional(),

    availableFrom: z.coerce.date().optional(),
    availableTo: z.coerce.date().optional(),

    groupSize: z.coerce.number().optional(),
    duration: z.coerce.number().optional(),

    guides: z.array(GuideSchema).optional(),

    info1: z.string().optional(),
    info2: z.string().optional(),
    info3: z.string().optional(),
    info4: z.string().optional(),
    info5: z.string().optional(),

    images: z.array(z.string()).optional(),
    imageThumbnail: z.string().optional(),
    attachment: z
      .object({
        url: z.string(),
        name: z.string(),
        type: z.string(),
        size: z.number(),
      })
      .nullable()
      .optional(),

    advancePercent: z.coerce.number().optional(),
    advanceCheck: z.boolean().optional(),
    joinPercent: z.coerce.number().optional(),

    pricingOptions: z
      .array(PricingOptionSchema)
      .min(1, 'At least one pricing option is required'),

    translations: z.array(TourTranslationSchema).optional(),
  })

  /* ================= VALIDATIONS ================= */

  // FIXED MODE (non-flexible)
  .refine(
    (data) => {
      if (!data.isFlexibleDate) {
        if (data.isGroupTour) {
          // group tour → multiple start dates only
          return Array.isArray(data.startDate) && data.startDate.length > 0;
        }

        // single tour → start + end
        return !!data.startDate && !!data.endDate;
      }
      return true;
    },
    {
      message: 'Start date (and end date for non-group tours) is required',
      path: ['startDate'],
    },
  )

  // FLEXIBLE MODE
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

  // FLEXIBLE RANGE ORDER
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

/**
 * Form-level translation pricing type – allows `''` (empty string)
 * so React Hook Form can track the field as "set but empty".
 * Zod `optionalNumber` converts `''` → `undefined` on validation.
 */
export type PricingOptionTranslationFormValue = {
  optionId: string;
  title?: string;
  accommodationType?: string;
  note?: string;
  pricePerPerson?: number | string;
  domesticFlightPerPerson?: number | string;
  singleSupplement?: number | string;
};

type InferredTranslation = NonNullable<
  TourCreateFormType['translations']
>[number];

/** Widened translation type for form state (allows `''` in pricing numerics). */
export type TourTranslationFormValue = Omit<
  InferredTranslation,
  'pricingOptions'
> & {
  pricingOptions?: PricingOptionTranslationFormValue[];
};

/** Form values type – same as `TourCreateFormType` but translations allow `''` in pricing numerics. */
export type TourFormValues = Omit<TourCreateFormType, 'translations'> & {
  translations?: TourTranslationFormValue[];
};
