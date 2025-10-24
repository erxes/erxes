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
  [{ key: 'companyIds', value: 'Company / Project', icon: IconBuilding }],
  [
    { key: 'userIds', value: 'Created By', icon: IconUserPlus },
    { key: 'assignedUserIds', value: 'Assigned To', icon: IconUserShare },
  ],
  [
    { key: 'createdStartDate', value: 'Date created', icon: IconCalendar },
    { key: 'startDateStartDate', value: 'Start date', icon: IconCalendarBolt },
    { key: 'startDateEndDate', value: 'End date', icon: IconCalendarX },
    { key: 'cycle', value: 'Cycle', icon: IconCalendarClock },
  ],
  [
    { key: 'priority', value: 'Priority', icon: IconStackFront },
    { key: 'labelIds', value: 'Label', icon: IconLabel },
    { key: 'tagIds', value: 'Tags', icon: IconTag },
    { key: 'awaiting', value: 'Awaiting response', icon: IconLoader },
  ],
  [{ key: 'advanced', value: 'Advanced filters', icon: IconFilter }],
];