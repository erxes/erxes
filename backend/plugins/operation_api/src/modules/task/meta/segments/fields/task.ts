import { SegmentField, SegmentFieldMeta } from 'erxes-api-shared/core-modules';

/**
 * Filterable task fields.
 *
 * Declared per field rather than derived from the schema: the document also
 * carries the GitHub integration's issue numbers and an internal status
 * counter, which nobody builds an audience on.
 *
 * The reference fields are plain ids: a status, team, cycle, project and
 * milestone are all tenant records with no picker of their own yet.
 */

export const TASK_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  SegmentField.text({ key: 'name', label: 'Name' }),
  SegmentField.text({ key: 'description', label: 'Description' }),
  SegmentField.number({ key: 'number', label: 'Number' }),
  SegmentField.number({ key: 'priority', label: 'Priority' }),
  SegmentField.number({ key: 'estimatePoint', label: 'Estimate point' }),

  // `taskStatus` is registered as a property input by `operation_ui`, and it
  // resolves the team itself - so this is a real picker rather than a box the
  // user has to paste an id into.
  SegmentField.component({
    key: 'status',
    label: 'Status',
    component: 'taskStatus',
  }),

  SegmentField.text({ key: 'teamId', label: 'Team' }),
  SegmentField.text({ key: 'cycleId', label: 'Cycle' }),
  SegmentField.text({ key: 'projectId', label: 'Project' }),
  SegmentField.text({ key: 'milestoneId', label: 'Milestone' }),
  SegmentField.text({ key: 'labelIds', label: 'Labels' }),

  SegmentField.lookup({
    key: 'assigneeId',
    label: 'Assignee',
    query: { name: 'users', labelField: 'email' },
  }),
  SegmentField.lookup({
    key: 'createdBy',
    label: 'Created by',
    query: { name: 'users', labelField: 'email' },
  }),
  SegmentField.lookup({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),

  SegmentField.date({ key: 'startDate', label: 'Start date' }),
  SegmentField.date({ key: 'targetDate', label: 'Target date' }),
  SegmentField.date({ key: 'statusChangedDate', label: 'Status changed date' }),
  SegmentField.date({ key: 'createdAt', label: 'Created at' }),
  SegmentField.date({ key: 'updatedAt', label: 'Modified at' }),
];
