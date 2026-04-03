import { z } from 'zod';

export const findObjectConfigFormSchema = z.object({
  propertyType: z.string(),
  propertyField: z.string(),
  propertyValue: z.string(),
});

export type TAutomationFindObjectConfig = z.infer<
  typeof findObjectConfigFormSchema
>;
