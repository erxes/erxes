import { z } from 'zod';

const managePropertyRuleSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  fieldLabel: z.string().optional(),
  operator: z.string().min(1, 'Operator is required'),
  value: z.any().optional(),
  isExpression: z.boolean().optional(),
});

const setPropertyTargetSchema = z.object({
  label: z.string().optional(),
  type: z.string().optional(),
  source: z.enum(['target', 'relation', 'resolver']).optional(),
  cardinality: z.enum(['one', 'many']).optional(),
  sourceType: z.string().optional(),
  relation: z
    .object({
      contentType: z.string(),
      relatedContentType: z.string(),
    })
    .optional(),
  resolverKey: z.string().optional(),
  pluginName: z.string().optional(),
  value: z.string().optional(),
  description: z.string().optional(),
});

export const managePropertiesFormSchema = z.object({
  module: z.string(),
  setPropertyTarget: setPropertyTargetSchema.optional(),
  targetTriggerId: z.string().optional(),
  targetActionId: z.string().optional(),
  rules: z.array(managePropertyRuleSchema).default([]),
});

export type TManagePropertiesForm = z.infer<typeof managePropertiesFormSchema>;
