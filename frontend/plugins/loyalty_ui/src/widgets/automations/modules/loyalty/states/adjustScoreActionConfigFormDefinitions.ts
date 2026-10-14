import { z } from 'zod';

export const ADJUST_SCORE_MODES = ['campaign', 'fixed'] as const;

export const adjustScoreActionConfigFormSchema = z
  .object({
    attribution: z.string().min(1, 'Select who receives the score'),
    // `fixed` gives a set number of points into a wallet; `campaign` earns
    // through a campaign's table. Steps saved before modes are `campaign`.
    mode: z.enum(ADJUST_SCORE_MODES).catch('campaign'),
    campaignId: z.string().optional(),
    accountTypeId: z.string().optional(),
    points: z.number().optional(),
    // Points paid with are recorded by the selling side; an automation only
    // gives. Older configs that subtracted are saved back as giving.
    action: z.literal('add').catch('add'),
    // Earning rows this automation turns on.
    earnRowKeys: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'campaign' && !data.campaignId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['campaignId'],
        message: 'Select a score campaign',
      });
    }

    if (data.mode === 'fixed' && !data.accountTypeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['accountTypeId'],
        message: 'Select a wallet',
      });
    }

    if (data.mode === 'fixed' && !(Number(data.points) > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['points'],
        message: 'Points must be more than zero',
      });
    }
  });

export type TAdjustScoreActionConfigForm = z.infer<
  typeof adjustScoreActionConfigFormSchema
>;
