import { AutomationNodesType, AutomationNodeType } from '@/automations/types';
import { z } from 'zod';

export const automationNodePositionSchema = z
  .object({
    x: z.number(),
    y: z.number(),
  })
  .optional();

const automationTriggerBaseSchema = z.object({
  id: z.string(),
  type: z.string(),
  actionId: z.string().optional(),
  config: z.any(),
  icon: z.any(),
  label: z.string(),
  description: z.string(),
  isCustom: z.boolean().default(false).readonly().optional(),
  position: automationNodePositionSchema,
});

const automationTriggerSchema = automationTriggerBaseSchema
  .refine(
    ({ type, config }) => {
      return type.includes('core:') && !!Object.keys(config)?.length;
    },
    {
      path: ['config'],
      message: 'Each trigger must include a config ',
    },
  )
  .refine(
    ({ config, isCustom }) => {
      // Only enforce contentId check if not custom

      if (!isCustom) {
        return !!config?.contentId;
      }

      // If custom, it's valid regardless of contentId
      return true;
    },
    {
      path: ['config'],
      message: 'Each non-custom trigger must include a config with segment',
    },
  );

const automationActionSchema = z.object({
  id: z.string(),
  type: z.string(),
  config: z.record(z.any(), {
    message: 'Action configuration must not be empty',
  }),
  icon: z.any(),
  nextActionId: z.string().default('').optional(),
  label: z.string(),
  description: z.string(),
  isCustom: z.boolean().readonly().optional(),
  position: automationNodePositionSchema,
  workflowId: z.string().optional(),
});

const automationWorkflowSchema = z.object({
  id: z.string(),
  automationId: z.string(),
  nextActionId: z.string().optional(),
  name: z.string(),
  description: z.string(),
  config: z.record(z.any()),
  position: automationNodePositionSchema,
});

export const automationBuilderFormSchema = z.object({
  name: z.string(),
  status: z.string(z.enum(['active', 'draft'])).default('draft'),
  triggers: z.array(automationTriggerSchema, {
    message: 'A trigger is required to save this automation.',
  }),
  actions: z.array(automationActionSchema, {
    message: 'A action is required to save this automation.',
  }),
  workflows: z.array(automationWorkflowSchema).optional(),
});

const automationNodeStateSchema = z.discriminatedUnion('nodeType', [
  automationTriggerBaseSchema.extend({
    nodeType: z.literal(AutomationNodeType.Trigger),
  }),
  automationActionSchema.extend({
    nodeType: z.literal(AutomationNodeType.Action),
  }),
  automationWorkflowSchema.extend({
    nodeType: z.literal(AutomationNodeType.Workflow),
  }),
]);

export type TAutomationNodeState = z.infer<typeof automationNodeStateSchema>;

export type TAutomationBuilderForm = z.infer<
  typeof automationBuilderFormSchema
>;

export type TAutomationBuilderActions =
  TAutomationBuilderForm[AutomationNodesType.Actions];

export type TAutomationBuilderTriggers =
  TAutomationBuilderForm[AutomationNodesType.Triggers];

export type TAutomationBuilderWorkflows =
  TAutomationBuilderForm[AutomationNodesType.Workflows];
