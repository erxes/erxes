import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';

export const SALES_REFERENCE_TYPES: TRecordReferencesConfig['types'] = [
  {
    type: 'deal',
    label: 'Deal',
    fields: [
      {
        key: 'displayName',
        label: 'Display name',
        resolver: 'dealDisplayName',
      },
      { key: '_id', label: 'Deal ID' },
      { key: 'name', label: 'Deal name' },
      { key: 'number', label: 'Deal number' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'score', label: 'Score' },
      { key: 'totalAmount', label: 'Total amount' },
      { key: 'unUsedTotalAmount', label: 'Unused total amount' },
      { key: 'bothTotalAmount', label: 'Both total amount' },
      { key: 'stageChangedDate', label: 'Stage changed date' },
      { key: 'startDate', label: 'Start date' },
      { key: 'closeDate', label: 'Close date' },
      { key: 'createdAt', label: 'Created at' },
      { key: 'updatedAt', label: 'Updated at' },

      {
        key: 'stage',
        label: 'Stage',
        reference: {
          type: 'stage',
          kind: 'field',
          path: 'stageId',
        },
      },

      {
        key: 'initialStage',
        label: 'Initial stage',
        reference: {
          type: 'stage',
          kind: 'field',
          path: 'initialStageId',
        },
      },

      {
        key: 'createdBy',
        label: 'Created by',
        reference: {
          type: 'core:user',
          kind: 'field',
          path: 'userId',
        },
      },

      {
        key: 'assignedUsers',
        label: 'Assigned users',
        reference: {
          type: 'core:user',
          kind: 'field',
          path: 'assignedUserIds',
        },
      },

      {
        key: 'watchedUsers',
        label: 'Watched users',
        reference: {
          type: 'core:user',
          kind: 'field',
          path: 'watchedUserIds',
        },
      },

      {
        key: 'tags',
        label: 'Tags',
        reference: {
          type: 'core:tag',
          kind: 'field',
          path: 'tagIds',
        },
      },

      {
        key: 'labels',
        label: 'Labels',
        reference: {
          type: 'pipelineLabels',
          kind: 'field',
          path: 'labelIds',
        },
      },

      {
        key: 'branches',
        label: 'Branches',
        reference: {
          type: 'core:branch',
          kind: 'field',
          path: 'branchIds',
        },
      },

      {
        key: 'departments',
        label: 'Departments',
        reference: {
          type: 'core:department',
          kind: 'field',
          path: 'departmentIds',
        },
      },

      {
        key: 'customers',
        label: 'Customers',
        reference: {
          type: 'core:customer',
          kind: 'relation',
          relType: 'customer',
        },
      },

      {
        key: 'companies',
        label: 'Companies',
        reference: {
          type: 'core:company',
          kind: 'relation',
          relType: 'company',
        },
      },

      {
        key: 'link',
        label: 'Deal link',
        resolver: 'dealLink',
      },

      {
        key: 'pipelineLabels',
        label: 'Pipeline labels',
        resolver: 'pipelineLabels',
      },

      {
        key: 'productsAmount',
        label: 'Products amount',
        resolver: 'productsAmount',
      },
      {
        key: 'excludeLoyaltyAmount',
        label: 'Exclude loyalty amount',
        resolver: 'excludeLoyaltyAmount',
      },
    ],
  },

  {
    type: 'stage',
    label: 'Stage',
    fields: [
      { key: 'displayName', label: 'Display name', path: 'name' },
      { key: '_id', label: 'Stage ID' },
      { key: 'name', label: 'Name' },
      { key: 'probability', label: 'Probability' },
      { key: 'status', label: 'Status' },
      { key: 'pipelineId', label: 'Pipeline ID' },
    ],
  },

  {
    type: 'pipelineLabels',
    label: 'Pipeline labels',
    fields: [
      { key: 'displayName', label: 'Display name', path: 'name' },
      { key: '_id', label: 'Label ID' },
      { key: 'name', label: 'Name' },
      { key: 'colorCode', label: 'Color' },
    ],
  },
];
