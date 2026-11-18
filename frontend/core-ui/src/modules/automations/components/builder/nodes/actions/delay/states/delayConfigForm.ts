import { z } from 'zod';

export const delayConfigFormSchema = z.object({
  value: z.string(),
  type: z.enum(['minute', 'hour', 'day', 'month', 'year']).optional(),
  // Count only the branch's working hours; the record's branch wins over branchId.
  workingTime: z.boolean().optional(),
  branchId: z.string().optional(),
});

export type TDelayConfigForm = z.infer<typeof delayConfigFormSchema>;
