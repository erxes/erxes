import { IPropertyMeta } from 'erxes-api-shared/core-modules';

export const properties: IPropertyMeta = {
  types: [
    {
      description: 'Inbox',
      type: 'conversation',
      systemFields: [
        { code: 'number', name: 'Number', type: 'number' },
        { code: 'content', name: 'Content', type: 'textarea' },
        { code: 'status', name: 'Status', type: 'select' },
        { code: 'integrationId', name: 'Integration', type: 'relation' },
        { code: 'customerId', name: 'Customer', type: 'relation' },
        { code: 'assignedUserId', name: 'Assigned to', type: 'relation' },
        { code: 'tagIds', name: 'Tags', type: 'multiSelect' },
        { code: 'messageCount', name: 'Message count', type: 'number' },
        { code: 'createdAt', name: 'Created at', type: 'date' },
        { code: 'closedAt', name: 'Closed at', type: 'date' },
      ],
    },
    {
      description: 'Tickets',
      type: 'ticket',
      // Name, channel, pipeline, status and description are fixed on the create
      // form; the rest are the default first row, so they show until turned off.
      systemFields: [
        {
          code: 'name',
          name: 'Name',
          type: 'text',
          alwaysFilled: true,
          outsideLayout: true,
          visibleToCreateByDefault: true,
        },
        { code: 'number', name: 'Number', type: 'text', notOnCreate: true },
        {
          code: 'channelId',
          name: 'Channel',
          type: 'select',
          alwaysFilled: true,
          outsideLayout: true,
          visibleToCreateByDefault: true,
        },
        {
          code: 'pipelineId',
          name: 'Pipeline',
          type: 'select',
          alwaysFilled: true,
          outsideLayout: true,
          visibleToCreateByDefault: true,
        },
        {
          code: 'statusId',
          name: 'Status',
          type: 'select',
          alwaysFilled: true,
          outsideLayout: true,
          visibleToCreateByDefault: true,
        },
        {
          code: 'priority',
          name: 'Priority',
          type: 'select',
          visibleToCreateByDefault: true,
        },
        {
          code: 'assigneeId',
          name: 'Assigned to',
          type: 'relation',
          visibleToCreateByDefault: true,
        },
        {
          code: 'labelIds',
          name: 'Labels',
          type: 'multiSelect',
          notOnCreate: true,
        },
        {
          code: 'tagIds',
          name: 'Tags',
          type: 'multiSelect',
          visibleToCreateByDefault: true,
        },
        {
          code: 'startDate',
          name: 'Start date',
          type: 'date',
          visibleToCreateByDefault: true,
        },
        {
          code: 'targetDate',
          name: 'Target date',
          type: 'date',
          visibleToCreateByDefault: true,
        },
        {
          code: 'branchId',
          name: 'Branch',
          type: 'relation',
          visibleToCreateByDefault: true,
        },
        {
          code: 'departmentId',
          name: 'Department',
          type: 'relation',
          visibleToCreateByDefault: true,
        },
        {
          code: 'companyId',
          name: 'Company',
          type: 'relation',
          notOnCreate: true,
        },
        {
          code: 'attachments',
          name: 'Attachments',
          type: 'file',
          notOnCreate: true,
        },
        {
          code: 'description',
          name: 'Description',
          type: 'textarea',
          outsideLayout: true,
          visibleToCreateByDefault: true,
        },
      ],
    },
  ],
};
