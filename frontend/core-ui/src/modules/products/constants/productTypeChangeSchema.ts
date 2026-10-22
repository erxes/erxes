import { z } from 'zod';

export const PRODUCT_TYPE_CHANGE_DURATION_UNITS = [
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'quarter',
  'year',
] as const;

export const productTypeChangeSchema = z
  .object({
    type: z.enum(['product', 'service', 'unique', 'subscription']),
    duration: z
      .number()
      .finite('Duration must be finite')
      .positive('Duration must be greater than 0')
      .optional(),
    durationType: z.enum(PRODUCT_TYPE_CHANGE_DURATION_UNITS).optional(),
  })
  .superRefine((values, context) => {
    if (values.type !== 'unique') return;
    if (values.duration === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['duration'],
        message: 'Duration is required for unique products',
      });
    }
    if (!values.durationType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['durationType'],
        message: 'Duration type is required for unique products',
      });
    }
  });
