import {
  componentField,
  dateField,
  lookupField,
  numberField,
  SegmentFieldMeta,
  textField,
} from 'erxes-api-shared/core-modules';

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
  textField({ key: 'name', label: 'Name' }),
  textField({ key: 'description', label: 'Description' }),
  numberField({ key: 'number', label: 'Number' }),
  numberField({ key: 'priority', label: 'Priority' }),
  numberField({ key: 'estimatePoint', label: 'Estimate point' }),

  // `taskStatus` is registered as a property input by `operation_ui`, and it
  // resolves the team itself - so this is a real picker rather than a box the
  // user has to paste an id into.
  componentField({ key: 'status', label: 'Status', component: 'taskStatus' }),

  textField({ key: 'teamId', label: 'Team' }),
  textField({ key: 'cycleId', label: 'Cycle' }),
  textField({ key: 'projectId', label: 'Project' }),
  textField({ key: 'milestoneId', label: 'Milestone' }),
  textField({ key: 'labelIds', label: 'Labels' }),

  lookupField({
    key: 'assigneeId',
    label: 'Assignee',
    query: { name: 'users', labelField: 'email' },
  }),
  lookupField({
    key: 'createdBy',
    label: 'Created by',
    query: { name: 'users', labelField: 'email' },
  }),
  lookupField({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),

  dateField({ key: 'startDate', label: 'Start date' }),
  dateField({ key: 'targetDate', label: 'Target date' }),
  dateField({ key: 'statusChangedDate', label: 'Status changed date' }),
  dateField({ key: 'createdAt', label: 'Created at' }),
  dateField({ key: 'updatedAt', label: 'Modified at' }),
];
