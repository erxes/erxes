import { TAutomationRuntimeOutputDefinition } from 'erxes-api-shared/core-modules';
import { ITicket } from '~/modules/ticket/@types/ticket';

export const FRONTLINE_TICKET_TARGET_SOURCE_TYPE = 'frontline:ticket.ticket';

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
      key: 'companyIds',
      label: 'Companies',
      exposure: 'reference',
      field: 'companyIds',
      referenceType: 'core:company',
    },
    { key: 'state', label: 'State' },
    { key: 'startDate', label: 'Start date' },
    { key: 'targetDate', label: 'Target date' },
    { key: 'statusChangedDate', label: 'Status changed date' },
    { key: 'createdAt', label: 'Created at' },
    { key: 'updatedAt', label: 'Updated at' },
  ],
  propertySource: {
    key: 'properties',
    label: 'Ticket properties',
    propertyType: 'frontline:ticket',
  },
};

export const ticketsAutomationContants = {
  triggers: [
    {
      moduleName: 'tickets',
      collectionName: 'tickets',
      icon: 'IconTicket',
      label: 'Tickets',
      description:
        'Start with a blank workflow that enrolls and is triggered off tickets',
      output: TICKET_OUTPUT,
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
      isTargetSource: true,
      targetSourceType: FRONTLINE_TICKET_TARGET_SOURCE_TYPE,
      allowTargetFromActions: true,
      output: TICKET_OUTPUT,
    },
  ],
};
