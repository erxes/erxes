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
  targetTriggerId?: string;
  segmentId?: string;
  webhookConfig?: TIncomingWebhookForm;
};
