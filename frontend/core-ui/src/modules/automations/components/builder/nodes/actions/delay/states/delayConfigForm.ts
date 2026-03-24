import { z } from 'zod';

export const delayConfigFormSchema = z.object({
  value: z.string(),
  type: z.enum(['minute', 'hour', 'day', 'month', 'year']).optional(),
});

export type TDelayConfigForm = z.infer<typeof delayConfigFormSchema>;
