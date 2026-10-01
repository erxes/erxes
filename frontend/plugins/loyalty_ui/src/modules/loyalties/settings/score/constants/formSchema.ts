import { z } from 'zod';

const optionalIds = z.array(z.string()).optional();

// Cells stay strings while editing; utils/earnTableForm converts them. Rows
// are checked only in table mode (see the campaign schema's superRefine).
export const earnRowFormSchema = z.object({
  key: z.string().optional(),
  name: z.string(),
  kind: z.enum(['base', 'bonus']),
  valueType: z.enum(['percent', 'fixed', 'multiplier']),
  scope: z.enum(['all', 'tiers']),
  cap: z.string().optional(),
  values: z.record(z.string(), z.string().optional()),
  conditions: z.object({
    minAmount: z.string().optional(),
    maxAmount: z.string().optional(),
    firstPurchase: z.boolean().optional(),
    sources: z.array(z.string()).optional(),
    productCategoryIds: optionalIds,
    productIds: optionalIds,
    tagIds: optionalIds,
  }),
});

const isFilled = (value?: string) =>
  value !== undefined && value !== '' && !Number.isNaN(Number(value));

export const earnTableFormSchema = z.object({
  amountSource: z.enum(['paid', 'total']),
  rounding: z.enum(['floor', 'round', 'none']),
  rows: z.array(earnRowFormSchema),
});

export const loyaltyScoreFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    order: z.preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.coerce.number().optional(),
    ),
    conditions: z.object({
      productCategoryIds: z.array(z.string()).optional(),
      productIds: z.array(z.string()).optional(),
      tagIds: z.array(z.string()).optional(),
      excludeProductCategoryIds: z.array(z.string()).optional(),
      excludeProductIds: z.array(z.string()).optional(),
      excludeTagIds: z.array(z.string()).optional(),
    }),
    additionalConfig: z
      .object({
        discountCheck: z.boolean().optional(),
      })
      .optional(),
    add: z.object({ table: earnTableFormSchema }),
    subtract: z.object({
      rules: z.object({
        minBalance: z.string().optional(),
        maxShare: z.string().optional(),
        step: z.string().optional(),
      }),
    }),
    accountTypeId: z.string().optional(),
    // A campaign from before account types still writes the default score.
    legacyDefaultScore: z.boolean().optional(),
  })
  .superRefine(({ accountTypeId, legacyDefaultScore, add, subtract }, ctx) => {
    if (!accountTypeId && !legacyDefaultScore) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Wallet is required',
        path: ['accountTypeId'],
      });
    }

    const maxShare = subtract?.rules?.maxShare;

    if (maxShare && Number(maxShare) > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At most 100%',
        path: ['subtract', 'rules', 'maxShare'],
      });
    }

    (add.table.rows || []).forEach((row, index) => {
      const path = ['add', 'table', 'rows', index];

      if (!row.name.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Name is required',
          path: [...path, 'name'],
        });
      }

      const cells = Object.entries(row.values || {})
        .filter(([key]) => (row.scope === 'all') === (key === 'all'))
        .map(([, value]) => value);

      if (!cells.some(isFilled)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a value for at least one tier',
          path: [...path, 'values'],
        });
      }
    });
  });

export type LoyaltyScoreFormValues = z.infer<typeof loyaltyScoreFormSchema>;
export type EarnTableFormValues = z.infer<typeof earnTableFormSchema>;
export type EarnRowFormValues = z.infer<typeof earnRowFormSchema>;
