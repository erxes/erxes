import { z } from 'zod';

export const DonationTypeSchema = z.enum(['fixed', 'percentage', 'free']);
export const DonationStatusSchema = z.enum(['active', 'inactive', 'expired']);

export const donationFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  status: z.string().optional(),
  startDate: z
    .union([z.string(), z.date()])
    .refine((val) => val !== '', 'Start date is required'),
  endDate: z
    .union([z.string(), z.date()])
    .refine((val) => val !== '', 'End date is required'),
  kind: z.string().default('voucher'),
  maxScore: z.number().min(0, 'Max score must be at least 0'),

  awards: z
    .array(
      z.object({
        minScore: z.number().min(0, 'Min score must be at least 0'),
        voucherCampaignId: z.string().optional(),
      }),
    )
    .optional(),
});

export type DonationFormValues = z.infer<typeof donationFormSchema>;
