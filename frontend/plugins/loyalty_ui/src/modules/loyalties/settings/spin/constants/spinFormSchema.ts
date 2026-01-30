import { z } from 'zod';

export const SpinTypeSchema = z.enum(['fixed', 'percentage', 'free']);
export const SpinStatusSchema = z.enum(['active', 'inactive', 'expired']);

export const spinFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  status: z.string().optional(),
  startDate: z
    .union([z.string(), z.date()])
    .refine((val) => val !== '', 'Start date is required'),
  endDate: z
    .union([z.string(), z.date()])
    .refine((val) => val !== '', 'End date is required'),
  kind: z.string().default('voucher'),

  conditions: z
    .array(
      z.object({
        name: z.string().min(1, 'Name is required'),
        voucherCampaignId: z.string().optional(),
        probablity: z.number().min(0, 'Probability must be at least 0'),
        buyScore: z.number().min(0, 'Max score must be at least 0'),
      }),
    )
    .optional(),
});

export type SpinFormValues = z.infer<typeof spinFormSchema>;
