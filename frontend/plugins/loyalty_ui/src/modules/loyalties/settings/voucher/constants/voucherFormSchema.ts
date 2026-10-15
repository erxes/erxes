import { z } from 'zod';
import { VOUCHER_VALIDITY_UNITS } from '../utils/voucherTerm';

export const VoucherTypeSchema = z.enum(['fixed', 'percentage', 'free']);
export const VoucherStatusSchema = z.enum(['active', 'inactive', 'expired']);

const voucherFormFields = z.object({
  title: z.string().min(1, 'Title is required'),
  buyScore: z.string().min(1, 'Buy score must be positive'),
  type: z.string().default('product discount'),
  kind: z.string().default('amount'),
  value: z.number().min(0, 'Value must be positive'),
  description: z.string().optional(),
  status: z.string().optional(),
  count: z.number().min(0, 'Count must be positive').optional(),
  // Empty start means it runs from now; `noEndDate` means it never ends.
  startDate: z.union([z.string(), z.date()]).nullable().optional(),
  endDate: z.union([z.string(), z.date()]).nullable().optional(),
  noEndDate: z.boolean().default(true),
  minimumSpend: z.number().min(0, 'Minimum spend must be positive').optional(),
  maximumSpend: z.number().min(0, 'Maximum spend must be positive').optional(),
  categoryIds: z.array(z.string()).optional(),
  excludeCategoryIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
  excludeProductIds: z.array(z.string()).optional(),
  tag: z.array(z.string()).optional(),
  orExcludeTag: z.array(z.string()).optional(),
  bonusProduct: z.string().optional(),
  bonusCount: z.number().min(0, 'Bonus count must be positive').optional(),
  spinCount: z.number().min(0, 'Spin count must be positive').optional(),
  spinCampaignId: z.string().optional(),
  lottery: z.string().optional(),
  lotteryCount: z.number().min(0, 'Lottery count must be positive').optional(),
  // Empty count means no limit.
  ownerLimitCount: z.number().int().min(1).optional(),
  ownerLimitPeriod: z.enum(['campaign', 'year', 'month']).default('year'),
  // How long each voucher works once issued.
  validityMode: z.enum(['campaign', 'period']).default('period'),
  validityCount: z.number().int().min(1).optional(),
  validityUnit: z.enum(VOUCHER_VALIDITY_UNITS).default('month'),
});

export const voucherFormSchema = voucherFormFields.superRefine((data, ctx) => {
  if (!data.noEndDate && !data.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'End date is required',
    });
  }

  if (
    !data.noEndDate &&
    data.startDate &&
    data.endDate &&
    new Date(data.startDate) > new Date(data.endDate)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'End date must be after start date',
    });
  }

  if (data.validityMode === 'period' && !data.validityCount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['validityCount'],
      message: 'How long each voucher works is required',
    });
  }
});

export type VoucherFormValues = z.infer<typeof voucherFormSchema>;
