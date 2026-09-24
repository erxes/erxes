import {
  IconCalendarClock,
  IconHandFinger,
  IconRepeat,
  TablerIcon,
} from '@tabler/icons-react';
import { TCampaignSchedule } from './campaignSchedule';

export type TBroadcastTrigger = 'manual' | 'scheduled' | 'recurring';

/**
 * What actually sets a campaign going.
 *
 * Read from the schedule rather than from `kind`, which answers a different
 * and older question — how the audience is enrolled — and which the status
 * filters and the edit lock both still depend on. Kept here so the column and
 * the filter cannot end up disagreeing about the same campaign.
 */
export const BROADCAST_TRIGGERS: {
  value: TBroadcastTrigger;
  labelKey: string;
  Icon: TablerIcon;
}[] = [
  { value: 'manual', labelKey: 'trigger.manual', Icon: IconHandFinger },
  { value: 'scheduled', labelKey: 'trigger.scheduled', Icon: IconCalendarClock },
  { value: 'recurring', labelKey: 'trigger.recurring', Icon: IconRepeat },
];

const spec = (value?: string | null) =>
  BROADCAST_TRIGGERS.find((option) => option.value === value);

export const campaignTrigger = (
  row: TCampaignSchedule & { kind?: string },
): { Icon: TablerIcon; labelKey: string } => {
  if (row.scheduleDate?.every) {
    return spec('recurring') as { Icon: TablerIcon; labelKey: string };
  }

  if (row.scheduleDate?.dateTime) {
    return spec('scheduled') as { Icon: TablerIcon; labelKey: string };
  }

  // Nothing schedules it, so it is started by hand.
  return { Icon: IconHandFinger, labelKey: 'trigger.manual' };
};

export const triggerLabelKey = (value?: string | null) =>
  spec(value)?.labelKey ?? 'trigger.manual';

export const triggerIcon = (value?: string | null) =>
  spec(value)?.Icon ?? IconHandFinger;

/** Steps through the three, for the bar where there is nothing to pick from. */
export const nextTrigger = (value?: string | null): TBroadcastTrigger => {
  const at = BROADCAST_TRIGGERS.findIndex((option) => option.value === value);

  return BROADCAST_TRIGGERS[(at + 1) % BROADCAST_TRIGGERS.length].value;
};
