import { AssigneeActivityRow } from './AssigneeActivityRow';
import { PriorityChangedActivityRow } from './PriorityChangedActivityRow';
import { DescriptionChangedActivityRow } from './DescriptionChangedActivityRow';

export const customActivitiesRows = [
  {
    type: 'assignee',
    render: AssigneeActivityRow,
  },
  {
    type: 'priorityChanged',
    render: PriorityChangedActivityRow,
  },
  {
    type: 'description_change',
    render: DescriptionChangedActivityRow,
  },
];
