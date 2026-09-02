import {
  componentField,
  dateField,
  lookupField,
  numberField,
  SegmentFieldMeta,
  staticField,
  textField,
} from 'erxes-api-shared/core-modules';

/**
 * Filterable ticket fields.
 *
 * Declared per field rather than derived from the schema: a document carries
 * plenty a segment has no business filtering on - attachments, the mixed
 * property blobs, the internal status counter - and what is listed here is
 * what someone building an audience would name.
 */

export const TICKET_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  textField({ key: 'name', label: 'Name' }),
  textField({ key: 'number', label: 'Number' }),
  textField({ key: 'description', label: 'Description' }),

  staticField({
    key: 'type',
    label: 'Type',
    options: ['bug', 'ticket', 'feature', 'question', 'incident'],
  }),
  numberField({ key: 'priority', label: 'Priority' }),

  textField({ key: 'state', label: 'State' }),

  // `ticketStatus` is registered as a property input by `frontline_ui`, and it
  // resolves the channel and pipeline itself - so this is a real picker rather
  // than a box the user has to paste an id into.
  componentField({
    key: 'statusId',
    label: 'Status',
    component: 'ticketStatus',
  }),

  // Every remaining id below has neither a registered `propertyInputs`
  // component nor a list query in the cursor shape the generic select drives,
  // so there is nothing to plug in yet. Each becomes a picker by changing one
  // line here the moment either exists.
  textField({ key: 'stageId', label: 'Stage' }),
  textField({ key: 'pipelineId', label: 'Pipeline' }),
  textField({ key: 'channelId', label: 'Channel' }),

  lookupField({
    key: 'assigneeId',
    label: 'Assignee',
    query: { name: 'users', labelField: 'email' },
  }),
  lookupField({
    key: 'assignedMembers',
    label: 'Assigned members',
    query: { name: 'users', labelField: 'email' },
  }),
  lookupField({
    key: 'subscribedUserIds',
    label: 'Subscribed users',
    query: { name: 'users', labelField: 'email' },
  }),
  lookupField({
    key: 'userId',
    label: 'Created by',
    query: { name: 'users', labelField: 'email' },
  }),
  lookupField({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),

  lookupField({
    key: 'branchId',
    label: 'Branch',
    query: { name: 'branchesMain', labelField: 'title' },
  }),
  lookupField({
    key: 'departmentId',
    label: 'Department',
    query: { name: 'departmentsMain', labelField: 'title' },
  }),
  textField({ key: 'labelIds', label: 'Labels' }),
  lookupField({
    key: 'companyIds',
    label: 'Companies',
    query: { name: 'companies', labelField: 'primaryName' },
  }),

  dateField({ key: 'startDate', label: 'Start date' }),
  dateField({ key: 'targetDate', label: 'Target date' }),
  dateField({ key: 'statusChangedDate', label: 'Status changed date' }),
  dateField({ key: 'createdAt', label: 'Created at' }),
  dateField({ key: 'updatedAt', label: 'Modified at' }),
];
