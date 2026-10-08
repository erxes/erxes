import { z } from 'zod';
import { tierBandsIssue } from '~/modules/loyalties/settings/account-type/tierBands';

const tierBandSchema = z.object({
  tier: z.string(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const setTierActionConfigFormSchema = z
  .object({
    attribution: z.string().min(1, 'Select whose tier changes'),
    accountTypeId: z.string().min(1, 'Select a wallet'),
    // 'fixed' always sets `tier`; 'amount' picks one from the purchase total.
    mode: z.enum(['fixed', 'amount']),
    // Empty clears the tier.
    tier: z.string(),
    bands: z.array(tierBandSchema),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    onlyUpgrade: z.boolean(),
  })
  .superRefine(({ mode, bands }, ctx) => {
    if (mode !== 'amount') {
      return;
    }

    if (!bands.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter an amount for at least one tier',
        path: ['bands'],
      });
    }

    const issue = tierBandsIssue(bands);

    if (issue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          issue === 'overlap'
            ? 'Two tiers share amounts'
            : 'A range starts above where it ends',
        path: ['bands'],
      });
    }
  });

export type TSetTierActionConfigForm = z.infer<
  typeof setTierActionConfigFormSchema
>;
