import { z } from 'zod';

export const adjustScoreActionConfigFormSchema = z.object({
  attribution: z.string().min(1, 'Select who receives the score'),
  campaignId: z.string().min(1, 'Select a score campaign'),
  // Points paid with are recorded by the selling side; an automation only
  // gives. Older configs that subtracted are saved back as giving.
  action: z.literal('add').catch('add'),
  // Earning rows this automation turns on.
  earnRowKeys: z.array(z.string()).optional(),
});

export type TAdjustScoreActionConfigForm = z.infer<
  typeof adjustScoreActionConfigFormSchema
>;
