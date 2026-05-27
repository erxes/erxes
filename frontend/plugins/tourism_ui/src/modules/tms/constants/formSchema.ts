import { z } from 'zod';

const optionalPercentNumber = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  return Number(value);
}, z.number().min(0, 'Percent must be at least 0').max(100, 'Percent must be 100 or less').optional());

export const TmsFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    color: z.string().min(1, 'Color is required'),
    logo: z.string().optional().default(''),
    favIcon: z.string().optional().default(''),
    language: z.array(z.string()).optional().default([]),
    mainLanguage: z.string().optional().default(''),
    generalManager: z
      .array(z.string())
      .min(1, 'At least one general manager is required')
      .default([]),
    managers: z.array(z.string()).optional().default([]),
    payment: z.array(z.string()).optional().default([]),
    prepaid: z.boolean().optional().default(false),
    prepaidPercent: optionalPercentNumber,
    token: z.string().optional().default(''),
    otherPayments: z
      .array(
        z.object({
          type: z.string().min(1, 'Type is required'),
          title: z.string().min(1, 'Title is required'),
          config: z.string().optional(),
        }),
      )
      .optional()
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (data.prepaid && data.prepaidPercent === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prepaidPercent'],
        message: 'Prepaid percent is required',
      });
    }
  });

export type TmsFormType = z.infer<typeof TmsFormSchema>;
