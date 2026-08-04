import { z } from 'zod';

export const findObjectConfigFormSchema = z.object({
  objectType: z.string().min(1),
  lookupField: z.string().min(1),
  value: z.string(),
});

export type TAutomationFindObjectConfig = z.infer<
  typeof findObjectConfigFormSchema
>;
