import { z } from 'zod';

export const CouponTypeSchema = z.enum(['fixed', 'percentage', 'free']);
export const CouponStatusSchema = z.enum(['active', 'inactive', 'expired']);

export const couponFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  buyScore: z.string().min(1, 'Buy score must be positive'),
  kind: z.string().default('coupon'),
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
  codeLength: z.number().min(1, 'Code length must be positive').optional(),
  numberOfCodes: z
    .number()
    .min(1, 'Number of codes must be positive')
    .optional(),
  prefixUppercase: z.string().optional(),
  postfixUppercase: z.string().optional(),
  characterSet: z.string().optional(),
  pattern: z.string().optional(),
  usageLimit: z.number().min(0, 'Usage limit must be positive').optional(),
  redemptionLimitPerUser: z
    .number()
    .min(0, 'Redemption limit per user must be positive')
    .optional(),
  staticCode: z.string().optional(),
});

export type CouponFormValues = z.infer<typeof couponFormSchema>;
