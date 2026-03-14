import { AssigneeActivityRow } from './AssigneeActivityRow';
import { PriorityChangedActivityRow } from './PriorityChangedActivityRow';
import { internalNoteCustomActivity } from 'ui-modules';

export const customActivitiesRows = [
  {
    type: 'assignee',
    render: AssigneeActivityRow,
  },
  {
    type: 'priorityChanged',
    render: PriorityChangedActivityRow,
  },
  internalNoteCustomActivity,
];
