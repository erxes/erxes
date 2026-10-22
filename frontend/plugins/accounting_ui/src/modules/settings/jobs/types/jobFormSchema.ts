import { z } from 'zod';
import type { TFunction } from 'i18next';

export const JOB_DURATION_TYPES = ['real', 'minut', 'hour', 'day'] as const;
const durationTypeSchema = z.enum(JOB_DURATION_TYPES);

export const normalizeJobDurationType = (value?: string | null) => {
  return durationTypeSchema.safeParse(value).data ?? 'minut';
};

export const getJobFormSchema = (t: TFunction<'accounting'>) => {
  const itemSchema = z.object({
    productId: z.string().min(1, t('job-select-product')),
    uom: z.string().optional(),
    quantity: z
      .number({
        required_error: t('job-quantity-positive'),
        invalid_type_error: t('job-quantity-positive'),
      })
      .finite(t('job-quantity-positive'))
      .positive(t('job-quantity-positive')),
    costRatio: z
      .number()
      .finite(t('job-ratio-nonnegative'))
      .min(0, t('job-ratio-nonnegative'))
      .optional(),
  });

  const costSchema = z.object({
    name: z.string().trim().min(1, t('job-enter-cost-name')),
    amount: z
      .number({
        required_error: t('job-amount-nonnegative'),
        invalid_type_error: t('job-amount-nonnegative'),
      })
      .finite(t('job-amount-nonnegative'))
      .min(0, t('job-amount-nonnegative')),
    accountId: z.string().trim().min(1, t('job-select-posting-account')),
  });

  return z
    .object({
      code: z.string().optional(),
      name: z.string().min(1, t('job-enter-name')),
      description: z.string().optional(),
      duration: z
        .number()
        .finite(t('job-duration-nonnegative'))
        .min(0, t('job-duration-nonnegative'))
        .optional(),
      durationType: durationTypeSchema,
      laborCosts: z.array(costSchema),
      overheadCosts: z.array(costSchema),
      inputs: z.array(itemSchema).min(1, t('job-add-input')),
      outputs: z.array(itemSchema).min(1, t('job-add-output')),
      status: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.durationType !== 'real' && data.duration === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['duration'],
          message: t('job-enter-duration'),
        });
      }
      const totalCostRatio = data.outputs.reduce(
        (sum, item) => sum + (item.costRatio ?? 0),
        0,
      );

      if (!Number.isFinite(totalCostRatio) || totalCostRatio <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['outputs'],
          message: t('job-output-ratio-positive'),
        });
      }
    })
    .transform((data) => ({
      ...data,
      duration: data.durationType === 'real' ? undefined : data.duration,
    }));
};
