import {
  IconCalendarBolt,
  IconCalendarClock,
  IconCalendarPlus,
  IconCalendarX,
} from '@tabler/icons-react';

export const TICKET_DATE_FILTERS = [
  {
    queryKey: 'createdStartDate',
    field: 'createdAt',
    labelKey: 'created-at-label',
    label: 'Date created',
    icon: IconCalendarPlus,
  },
  {
    queryKey: 'startDateStartDate',
    field: 'startDate',
    labelKey: 'start-date-label',
    label: 'Start date',
    icon: IconCalendarBolt,
  },
  {
    queryKey: 'targetDateStartDate',
    field: 'targetDate',
    labelKey: 'due-date-label',
    label: 'Due date',
    icon: IconCalendarX,
  },
  {
    queryKey: 'statusChangedStartDate',
    field: 'statusChangedDate',
    labelKey: 'status-changed-date',
    label: 'Status changed date',
    icon: IconCalendarClock,
  },
] as const;

export type TicketDateFilterQueries = Record<
  (typeof TICKET_DATE_FILTERS)[number]['queryKey'],
  string
>;
