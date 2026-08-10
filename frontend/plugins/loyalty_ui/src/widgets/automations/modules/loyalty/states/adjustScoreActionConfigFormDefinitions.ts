import { z } from 'zod';

export const adjustScoreActionConfigFormSchema = z.object({
  attribution: z.string().min(1, 'Select who receives the score'),
  campaignId: z.string().min(1, 'Select a score campaign'),
  action: z.enum(['add', 'subtract'], {
    required_error: 'Choose whether to add or subtract score',
  }),
});

export type TAdjustScoreActionConfigForm = z.infer<
  typeof adjustScoreActionConfigFormSchema
>;
