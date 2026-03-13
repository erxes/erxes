import { z } from 'zod';

export const LotteryTypeSchema = z.enum(['fixed', 'percentage', 'free']);
export const LotteryStatusSchema = z.enum(['active', 'inactive', 'expired']);

export const lotteryFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.string().optional(),

  startDate: z
    .union([z.string(), z.date()])
    .refine((val) => val !== '', 'Start date is required'),

  endDate: z
    .union([z.string(), z.date()])
    .refine((val) => val !== '', 'End date is required'),

  kind: z.string().default('voucher'),

  buyScore: z.number().min(0, 'Score must be at least 0'),

  awards: z
    .array(
      z.object({
        name: z.string().min(1, 'Name is required'),
        voucherCampaignId: z.string().optional(),
        probablity: z.number().min(0, 'Probability must be at least 0'),
      }),
    )
    .optional(),
});

export type LotteryFormValues = z.infer<typeof lotteryFormSchema>;
