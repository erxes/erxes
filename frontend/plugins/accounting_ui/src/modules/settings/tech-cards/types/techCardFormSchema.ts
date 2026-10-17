import { z } from 'zod';
import type { TFunction } from 'i18next';

export const TECH_CARD_DURATION_TYPES = [
  'real',
  'minut',
  'hour',
  'day',
] as const;
const durationTypeSchema = z.enum(TECH_CARD_DURATION_TYPES);

export const normalizeTechCardDurationType = (value?: string) => {
  if (!value || value === 'минут') return 'minut' as const;
  return durationTypeSchema.safeParse(value).data ?? 'minut';
};

export const getTechCardFormSchema = (t: TFunction<'accounting'>) => {
  const itemSchema = z.object({
    productId: z.string().min(1, t('tech-card-select-product')),
    uom: z.string().optional(),
    quantity: z
      .number({
        required_error: t('tech-card-quantity-positive'),
        invalid_type_error: t('tech-card-quantity-positive'),
      })
      .finite(t('tech-card-quantity-positive'))
      .positive(t('tech-card-quantity-positive')),
    costRatio: z
      .number()
      .finite(t('tech-card-ratio-nonnegative'))
      .min(0, t('tech-card-ratio-nonnegative'))
      .optional(),
  });

  const costSchema = z.object({
    name: z.string().trim().min(1, t('tech-card-enter-cost-name')),
    amount: z
      .number({
        required_error: t('tech-card-amount-nonnegative'),
        invalid_type_error: t('tech-card-amount-nonnegative'),
      })
      .finite(t('tech-card-amount-nonnegative'))
      .min(0, t('tech-card-amount-nonnegative')),
    accountId: z.string().trim().min(1, t('tech-card-select-posting-account')),
  });

  return z
    .object({
      code: z.string().optional(),
      name: z.string().min(1, t('tech-card-enter-name')),
      description: z.string().optional(),
      duration: z
        .number()
        .finite(t('tech-card-duration-nonnegative'))
        .min(0, t('tech-card-duration-nonnegative'))
        .optional(),
      durationType: durationTypeSchema,
      laborCosts: z.array(costSchema),
      overheadCosts: z.array(costSchema),
      inputs: z.array(itemSchema).min(1, t('tech-card-add-input')),
      outputs: z.array(itemSchema).min(1, t('tech-card-add-output')),
      status: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.durationType !== 'real' && data.duration === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['duration'],
          message: t('tech-card-enter-duration'),
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
          message: t('tech-card-output-ratio-positive'),
        });
      }
    })
    .transform((data) => ({
      ...data,
      duration: data.durationType === 'real' ? undefined : data.duration,
    }));
};
