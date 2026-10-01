import { z } from 'zod';

export const TIER_DIRECTIONS = ['up', 'down', 'any'] as const;

export const tierChangedTriggerConfigFormSchema = z.object({
  accountTypeId: z.string().min(1, 'Select a wallet'),
  // Empty: any tier.
  toTier: z.string(),
  direction: z.enum(TIER_DIRECTIONS),
});

export type TTierChangedTriggerConfigForm = z.infer<
  typeof tierChangedTriggerConfigFormSchema
>;
