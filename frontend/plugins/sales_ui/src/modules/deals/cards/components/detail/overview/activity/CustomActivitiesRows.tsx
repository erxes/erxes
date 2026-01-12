import { AssigneeActivityRow } from './AssigneeActivityRow';
import { PriorityChangedActivityRow } from './PriorityChangedActivityRow';

export const customActivitiesRows = [
  {
    type: 'assignee',
    render: AssigneeActivityRow,
  },
  {
    type: 'priorityChanged',
    render: PriorityChangedActivityRow,
  },
];
