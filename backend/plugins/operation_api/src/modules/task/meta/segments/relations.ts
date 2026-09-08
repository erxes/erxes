import { SegmentRelationMeta } from 'erxes-api-shared/core-modules';
import { TASK_TYPE } from './fields';

export const TASK_SEGMENT_RELATIONS: SegmentRelationMeta[] = [
  {
    key: 'user.assignedTasks',
    label: 'Assigned tasks',
    subjectType: 'core:organization.users',
    relatedType: TASK_TYPE,
    join: { via: 'field', on: 'related', path: 'assigneeId' },
  },
  {
    key: 'user.createdTasks',
    label: 'Created tasks',
    subjectType: 'core:organization.users',
    relatedType: TASK_TYPE,
    join: { via: 'field', on: 'related', path: 'createdBy' },
  },
];
