import {
  IconBuilding,
  IconCalendar,
  IconCalendarBolt,
  IconCalendarClock,
  IconCalendarX,
  IconFilter,
  IconLabel,
  IconLoader,
  IconStackFront,
  IconTag,
  IconUserPlus,
  IconUserShare,
} from '@tabler/icons-react';

import { FilterItem } from '../types/actionBarTypes';

export const ActionBarFilters: FilterItem[][] = [
  [
    {
      icon: IconBuilding,
      value: 'Company / Project',
    },
  ],
  [
    {
      icon: IconUserPlus,
      value: 'Created By',
    },
    {
      icon: IconUserShare,
      value: 'Assigned To',
    },
  ],
  [
    {
      icon: IconCalendar,
      value: 'Date created',
    },
    {
      icon: IconCalendarBolt,
      value: 'Start date',
    },
    {
      icon: IconCalendarX,
      value: 'End date',
    },
    {
      icon: IconCalendarClock,
      value: 'Cycle',
    },
  ],
  [
    {
      icon: IconStackFront,
      value: 'Priority',
    },
    {
      icon: IconLabel,
      value: 'Label',
    },
    {
      icon: IconTag,
      value: 'Tags',
    },
    {
      icon: IconLoader  ,
      value: 'Awaiting response',
    },
  ],
  [
    {
      icon: IconFilter,
      value: 'Advanced filters',
    },
  ],
];
