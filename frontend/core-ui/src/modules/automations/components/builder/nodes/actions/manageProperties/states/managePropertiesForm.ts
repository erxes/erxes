import { z } from 'zod';

const managePropertyRuleSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: z.string().min(1, 'Operator is required'),
  value: z.any().optional(),
});

export const managePropertiesFormSchema = z.object({
  module: z.string(),
  targetTriggerId: z.string().optional(),
  targetActionId: z.string().optional(),
  rules: z.array(managePropertyRuleSchema).default([]),
});

export type TManagePropertiesForm = z.infer<typeof managePropertiesFormSchema>;
