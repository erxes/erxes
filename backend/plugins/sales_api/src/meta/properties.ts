import { IPropertyMeta } from 'erxes-api-shared/core-modules';

export const properties: IPropertyMeta = {
  types: [
    {
      description: 'Sales pipelines',
      type: 'deal',
      systemFields: [
        { code: 'name', name: 'Name', type: 'text' },
        { code: 'number', name: 'Number', type: 'text' },
        { code: 'stageId', name: 'Stage', type: 'select' },
        { code: 'status', name: 'Status', type: 'select' },
        { code: 'priority', name: 'Priority', type: 'select' },
        { code: 'assignedUserIds', name: 'Assigned to', type: 'relation' },
        { code: 'labelIds', name: 'Labels', type: 'multiSelect' },
        { code: 'tagIds', name: 'Tags', type: 'multiSelect' },
        { code: 'startDate', name: 'Start date', type: 'date' },
        { code: 'closeDate', name: 'Close date', type: 'date' },
        { code: 'branchIds', name: 'Branches', type: 'relation' },
        { code: 'departmentIds', name: 'Departments', type: 'relation' },
        { code: 'productsData', name: 'Products', type: 'relation' },
        { code: 'attachments', name: 'Attachments', type: 'file' },
        { code: 'description', name: 'Description', type: 'textarea' },
      ],
    },
  ],
};
