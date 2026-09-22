import { SegmentField, SegmentFieldMeta } from 'erxes-api-shared/core-modules';

/**
 * Filterable ticket fields.
 *
 * Declared per field rather than derived from the schema: a document carries
 * plenty a segment has no business filtering on - attachments, the mixed
 * property blobs, the internal status counter - and what is listed here is
 * what someone building an audience would name.
 */

export const TICKET_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  SegmentField.text({ key: 'name', label: 'Name' }),
  SegmentField.text({ key: 'number', label: 'Number' }),
  SegmentField.text({ key: 'description', label: 'Description' }),

  SegmentField.static({
    key: 'type',
    label: 'Type',
    options: ['bug', 'ticket', 'feature', 'question', 'incident'],
  }),
  SegmentField.number({ key: 'priority', label: 'Priority' }),

  SegmentField.text({ key: 'state', label: 'State' }),

  // `ticketStatus` is registered as a property input by `frontline_ui`, and it
  // resolves the channel and pipeline itself - so this is a real picker rather
  // than a box the user has to paste an id into.
  SegmentField.component({
    key: 'statusId',
    label: 'Status',
    component: 'ticketStatus',
  }),

  // Every remaining id below has neither a registered `propertyInputs`
  // component nor a list query in the cursor shape the generic select drives,
  // so there is nothing to plug in yet. Each becomes a picker by changing one
  // line here the moment either exists.
  SegmentField.text({ key: 'stageId', label: 'Stage' }),
  SegmentField.text({ key: 'pipelineId', label: 'Pipeline' }),
  SegmentField.text({ key: 'channelId', label: 'Channel' }),

  SegmentField.lookup({
    key: 'assigneeId',
    label: 'Assignee',
    query: { name: 'users', labelField: 'email' },
  }),
  SegmentField.lookup({
    key: 'assignedMembers',
    label: 'Assigned members',
    query: { name: 'users', labelField: 'email' },
  }),
  SegmentField.lookup({
    key: 'subscribedUserIds',
    label: 'Subscribed users',
    query: { name: 'users', labelField: 'email' },
  }),
  SegmentField.lookup({
    key: 'userId',
    label: 'Created by',
    query: { name: 'users', labelField: 'email' },
  }),
  SegmentField.lookup({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),

  SegmentField.lookup({
    key: 'branchId',
    label: 'Branch',
    query: { name: 'branchesMain', labelField: 'title' },
  }),
  SegmentField.lookup({
    key: 'departmentId',
    label: 'Department',
    query: { name: 'departmentsMain', labelField: 'title' },
  }),
  SegmentField.text({ key: 'labelIds', label: 'Labels' }),
  SegmentField.lookup({
    key: 'companyIds',
    label: 'Companies',
    query: { name: 'companies', labelField: 'primaryName' },
  }),

  SegmentField.date({ key: 'startDate', label: 'Start date' }),
  SegmentField.date({ key: 'targetDate', label: 'Target date' }),
  SegmentField.date({ key: 'statusChangedDate', label: 'Status changed date' }),
  SegmentField.date({ key: 'createdAt', label: 'Created at' }),
  SegmentField.date({ key: 'updatedAt', label: 'Modified at' }),
];
