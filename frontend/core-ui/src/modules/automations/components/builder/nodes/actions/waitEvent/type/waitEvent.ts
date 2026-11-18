import { TIncomingWebhookForm } from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';

export enum WaitEventTargetTypes {
  Trigger = 'trigger',
  Action = 'action',
  Custom = 'custom',
}

export type TAutomationWaitEventConfig = {
  targetType:
    | WaitEventTargetTypes.Trigger
    | WaitEventTargetTypes.Action
    | WaitEventTargetTypes.Custom;
  targetTypeId?: string;
  segmentId?: string;
  webhookConfig?: TIncomingWebhookForm;
  timeout?: TWaitEventTimeout;
  // With a timeout the node has two exits instead of nextActionId.
  met?: string;
  timedOut?: string;
};

export type TWaitEventTimeoutUnit = 'minutes' | 'hours' | 'days';

export type TWaitEventTimeout = {
  value: number | string;
  unit: TWaitEventTimeoutUnit;
};
