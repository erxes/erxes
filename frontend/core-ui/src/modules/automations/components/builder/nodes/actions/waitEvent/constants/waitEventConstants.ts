import {
  TAutomationWaitEventConfig,
  WaitEventTargetTypes,
} from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';

export interface WaitEventTypeOption {
  id: string;
  type: TAutomationWaitEventConfig['targetType'];
  label: string;
  icon?: string;
}

export const WAIT_EVENT_TYPES: WaitEventTypeOption[] = [
  {
    id: 'custom',
    type: WaitEventTargetTypes.Custom,
    label: 'API request (Custom)',
    icon: 'IconWebhook',
  },
];
