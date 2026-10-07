import { z } from 'zod';

export const setTierActionConfigFormSchema = z.object({
  attribution: z.string().min(1, 'Select whose tier changes'),
  accountTypeId: z.string().min(1, 'Select a wallet'),
  // Empty clears the tier.
  tier: z.string(),
});

export type TSetTierActionConfigForm = z.infer<
  typeof setTierActionConfigFormSchema
>;
