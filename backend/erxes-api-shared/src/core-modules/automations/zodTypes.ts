import { z } from 'zod';
import { TAutomationProducers } from './types';

export const AutomationBaseInput = z.object({
  subdomain: z.string(),
  data: z.any().optional(),
});

export const AutomationExecActionInput = z.object({
  createdAt: z.string().optional(),
  actionId: z.string(),
  actionType: z.string(),
  actionConfig: z.any().optional(),
  nextActionId: z.string().optional(),
  result: z.any().optional(),
});

export const AutomationExecutionInput = z.object({
  _id: z.string(),
  createdAt: z.string().optional(),
  modifiedAt: z.string().optional(),
  automationId: z.string(),
  triggerId: z.string(),
  triggerType: z.string(),
  triggerConfig: z.record(z.any()),
  nextActionId: z.string().optional(),
  targetId: z.string(),
  target: z.record(z.any()),
  status: z.string(),
  description: z.string(),
  actions: z.array(AutomationExecActionInput).optional(),
  startWaitingDate: z.date().optional(),
  waitingActionId: z.string().optional(),
  objToCheck: z.record(z.any()).optional(),
  responseActionId: z.string().optional(),
});

export const AutomationActionInput = z.object({
  id: z.string(),
  type: z.string(),
  nextActionId: z.string().optional(),
  config: z.any().optional(),
  style: z.any(),
  icon: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  workflowId: z.string().optional(),
  targetActionId: z.string().optional(),
});

export const ReceiveActionsInputData = z.object({
  moduleName: z.string(),
  actionType: z.string(),
  action: AutomationActionInput,
  execution: AutomationExecutionInput,
  collectionType: z.string(),
});
export const ReceiveActionsInput = AutomationBaseInput.extend({
  data: ReceiveActionsInputData,
});

export const CheckCustomTriggerInputData = z.object({
  moduleName: z.string(),
  collectionType: z.string(),
  relationType: z.string().optional(),
  automationId: z.string(),
  trigger: z.object({
    id: z.string(),
    type: z.string(),
    config: z.record(z.any()),
    actionId: z.string().optional(),
    style: z.any().optional(),
    icon: z.string().optional(),
    label: z.string().optional(),
    description: z.string().optional(),
    isCustom: z.boolean().optional(),
    workflowId: z.string().optional(),
  }),
  target: z.record(z.any()),
  config: z.record(z.any()),
});

export const ReplacePlaceholdersInputData = z.object({
  moduleName: z.string(),
  target: z.record(z.any()),
  config: z.record(z.any()),
  relatedValueProps: z
    .record(
      z.string(),
      z.object({
        key: z.string(),
        filter: z.object({ key: z.string(), value: z.any() }).optional(),
      }),
    )
    .optional(),
});

export const SetPropertiesInputData = z.object({
  moduleName: z.string(),
  triggerType: z.string(),
  targetType: z.string(),
  actionType: z.string(),
  action: AutomationActionInput,
  execution: AutomationExecutionInput,
  collectionType: z.string(),
});

export const CheckCustomTriggerInput = AutomationBaseInput.extend({
  data: CheckCustomTriggerInputData,
});

export const ReplacePlaceholdersInput = AutomationBaseInput.extend({
  data: ReplacePlaceholdersInputData,
});

export const SetPropertiesInput = AutomationBaseInput.extend({
  data: SetPropertiesInputData,
});

export type TAutomationProducersInput = {
  [TAutomationProducers.RECEIVE_ACTIONS]: z.infer<
    typeof ReceiveActionsInputData
  >;
  [TAutomationProducers.CHECK_CUSTOM_TRIGGER]: z.infer<
    typeof CheckCustomTriggerInputData
  >;
  [TAutomationProducers.REPLACE_PLACEHOLDERS]: z.infer<
    typeof ReplacePlaceholdersInputData
  >;
  [TAutomationProducers.SET_PROPERTIES]: z.infer<typeof SetPropertiesInputData>;
  [TAutomationProducers.GET_ADDITIONAL_ATTRIBUTES]: z.infer<
    typeof AutomationBaseInput
  >;
};
