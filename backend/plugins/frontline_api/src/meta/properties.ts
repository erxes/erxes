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
      systemFields: [
        { code: 'name', name: 'Name', type: 'text' },
        { code: 'number', name: 'Number', type: 'text' },
        { code: 'channelId', name: 'Channel', type: 'select' },
        { code: 'pipelineId', name: 'Pipeline', type: 'select' },
        { code: 'statusId', name: 'Status', type: 'select' },
        { code: 'priority', name: 'Priority', type: 'select' },
        { code: 'assigneeId', name: 'Assigned to', type: 'relation' },
        { code: 'labelIds', name: 'Labels', type: 'multiSelect' },
        { code: 'tagIds', name: 'Tags', type: 'multiSelect' },
        { code: 'startDate', name: 'Start date', type: 'date' },
        { code: 'targetDate', name: 'Target date', type: 'date' },
        { code: 'branchId', name: 'Branch', type: 'relation' },
        { code: 'departmentId', name: 'Department', type: 'relation' },
        { code: 'companyIds', name: 'Companies', type: 'relation' },
        { code: 'attachments', name: 'Attachments', type: 'file' },
        { code: 'description', name: 'Description', type: 'textarea' },
      ],
    },
  ],
};
