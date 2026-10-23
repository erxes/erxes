import {
  AUTOMATION_CORE_ACTIONS,
  TAutomationFindObjectTargetDefinition,
  TAutomationRuntimeOutputDefinition,
  TAutomationSetPropertyTarget,
} from 'erxes-api-shared/core-modules';
import { ITicket } from '~/modules/ticket/@types/ticket';

export const FRONTLINE_TICKET_TARGET_SOURCE_TYPE = 'frontline:tickets.tickets';

const FRONTLINE_TICKET_SET_PROPERTY_TARGETS: TAutomationSetPropertyTarget[] = [
  {
    label: 'Ticket',
    type: FRONTLINE_TICKET_TARGET_SOURCE_TYPE,
    source: 'target',
    cardinality: 'one',
  },
  // The ticket keeps one customer and one company itself.
  {
    label: 'Ticket customer',
    type: 'core:contacts.customers',
    source: 'targetField',
    targetPath: 'customerId',
    cardinality: 'one',
  },
  {
    label: 'Ticket company',
    type: 'core:contacts.companies',
    source: 'targetField',
    targetPath: 'companyId',
    cardinality: 'one',
  },
];

const TICKET_OUTPUT: TAutomationRuntimeOutputDefinition<ITicket> = {
  variables: [
    { key: '_id', label: 'Ticket ID', field: '_id' },
    { key: 'name', label: 'Ticket name' },
    { key: 'number', label: 'Ticket number' },
    { key: 'description', label: 'Description' },
    {
      key: 'channelId',
      label: 'Channel ID',
      exposure: 'reference',
      field: 'channelId',
      referenceType: 'frontline:channel',
    },
    {
      key: 'pipelineId',
      label: 'Pipeline ID',
      exposure: 'reference',
      field: 'pipelineId',
      referenceType: 'frontline:ticket.pipeline',
    },
    {
      key: 'statusId',
      label: 'Status ID',
      exposure: 'reference',
      field: 'statusId',
      referenceType: 'frontline:ticket.status',
    },
    { key: 'statusType', label: 'Status type' },
    { key: 'priority', label: 'Priority' },
    {
      key: 'assigneeId',
      label: 'Assignee',
      exposure: 'reference',
      field: 'assigneeId',
      referenceType: 'core:user',
    },
    {
      key: 'createdBy',
      label: 'Created by',
      exposure: 'reference',
      field: 'createdBy',
      referenceType: 'core:user',
    },
    {
      key: 'userId',
      label: 'User ID',
      exposure: 'reference',
      field: 'userId',
      referenceType: 'core:user',
    },
    {
      key: 'labelIds',
      label: 'Labels',
      exposure: 'reference',
      field: 'labelIds',
    },
    { key: 'tagIds', label: 'Tags', exposure: 'reference', field: 'tagIds' },
    {
      key: 'companyId',
      label: 'Company',
      exposure: 'reference',
      field: 'companyId',
      referenceType: 'core:company',
    },
    {
      key: 'customers',
      label: 'Customers',
      exposure: 'reference',
      field: 'customers',
      referenceType: 'core:customer',
    },
    {
      key: 'deals',
      label: 'Deals',
      exposure: 'reference',
      field: 'deals',
      referenceType: 'sales:deal',
    },
    { key: 'state', label: 'State' },
    { key: 'startDate', label: 'Start date' },
    { key: 'targetDate', label: 'Target date' },
    { key: 'statusChangedDate', label: 'Status changed date' },
    { key: 'link', label: 'Ticket link', isLink: true },
    { key: 'createdAt', label: 'Created at' },
    { key: 'updatedAt', label: 'Updated at' },
  ],
  propertySource: {
    key: 'properties',
    label: 'Ticket properties',
    propertyType: 'frontline:ticket',
  },
};

// Lets a flow reach an existing ticket — by the id an AI agent picked from
// the conversation's open tickets, or by its number — and act on it.
const TICKET_FIND_OBJECT_TARGETS: TAutomationFindObjectTargetDefinition[] = [
  {
    value: FRONTLINE_TICKET_TARGET_SOURCE_TYPE,
    label: 'Ticket',
    lookupFields: [
      { value: '_id', label: 'ID' },
      { value: 'number', label: 'Number' },
    ],
    output: TICKET_OUTPUT,
  },
];

export const ticketsAutomationContants = {
  findObjectTargets: TICKET_FIND_OBJECT_TARGETS,
  triggers: [
    {
      moduleName: 'tickets',
      collectionName: 'tickets',
      icon: 'IconTicket',
      label: 'Tickets',
      description:
        'Start with a blank workflow that enrolls and is triggered off tickets',
      output: TICKET_OUTPUT,
      setPropertyTargets: FRONTLINE_TICKET_SET_PROPERTY_TARGETS,
    },
  ],
  actions: [
    {
      moduleName: 'tickets',
      collectionName: 'tickets',
      method: 'create',
      icon: 'IconTicket',
      label: 'Create ticket',
      description: 'Create ticket',
      // The ticket it creates is assigned to someone.
      requiresActor: true,
      isTargetSource: true,
      targetSourceType: FRONTLINE_TICKET_TARGET_SOURCE_TYPE,
      allowTargetFromActions: true,
      output: TICKET_OUTPUT,
      setPropertyTargets: FRONTLINE_TICKET_SET_PROPERTY_TARGETS,
      // Behind an AI agent's tool the ticket is remembered, so a later
      // message about it can add to it instead of opening another.
      defaultsWhenAfter: [
        {
          actionType: AUTOMATION_CORE_ACTIONS.AI_AGENT,
          config: { remember: { as: 'ticket', fields: ['name', 'number'] } },
        },
      ],
    },
  ],
};
