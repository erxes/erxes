import {
  IconPlayerPause,
  IconRobot,
  IconUserCheck,
} from '@tabler/icons-react';

export const AUTOMATION_STATUS_FILTERS = [
  { value: 'responded', label: 'automation-responded', icon: IconRobot },
  { value: 'standby', label: 'automation-standby', icon: IconPlayerPause },
  { value: 'handoff', label: 'automation-handoff', icon: IconUserCheck },
] as const;

export type TAutomationStatusFilter =
  (typeof AUTOMATION_STATUS_FILTERS)[number]['value'];
