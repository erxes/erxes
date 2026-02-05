import { z } from 'zod';

export const VoucherTypeSchema = z.enum(['fixed', 'percentage', 'free']);
export const VoucherStatusSchema = z.enum(['active', 'inactive', 'expired']);

export const voucherFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  buyScore: z.string().min(1, 'Buy score must be positive'),
  type: z.string().default('product discount'),
  kind: z.string().default('amount'),
  value: z.number().min(0, 'Value must be positive'),
  description: z.string().optional(),
  status: z.string().optional(),
  count: z.number().min(0, 'Count must be positive').optional(),
  startDate: z
    .union([z.string(), z.date()])
    .refine((val) => val !== '', 'Start date is required'),
  endDate: z
    .union([z.string(), z.date()])
    .refine((val) => val !== '', 'End date is required'),
  minimumSpend: z.number().min(0, 'Minimum spend must be positive').optional(),
  maximumSpend: z.number().min(0, 'Maximum spend must be positive').optional(),
  categoryIds: z.array(z.string()).optional(),
  excludeCategoryIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
  excludeProductIds: z.array(z.string()).optional(),
  tag: z.string().optional(),
  orExcludeTag: z.string().optional(),
  bonusProduct: z.string().optional(),
  bonusCount: z.number().min(0, 'Bonus count must be positive').optional(),
  spinCount: z.number().min(0, 'Spin count must be positive').optional(),
  spinCampaignId: z.string().optional(),
  lottery: z.string().optional(),
  lotteryCount: z.number().min(0, 'Lottery count must be positive').optional(),
});

export type VoucherFormValues = z.infer<typeof voucherFormSchema>;
