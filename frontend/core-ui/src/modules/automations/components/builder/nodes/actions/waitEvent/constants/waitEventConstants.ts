import {
  TAutomationWaitEventConfig,
  WaitEventTargetTypes,
} from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';

export interface WaitEventTypeOption {
  type: TAutomationWaitEventConfig['targetType'];
  label: string;
}

export const WAIT_EVENT_TYPES: WaitEventTypeOption[] = [
  { type: WaitEventTargetTypes.Trigger, label: 'Trigger event' },
  { type: WaitEventTargetTypes.Action, label: 'Action target event' },
  { type: WaitEventTargetTypes.Custom, label: 'API request' },
];
