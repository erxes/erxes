import {
  SEGMENT_ID_OPERATORS,
  SegmentField,
  SegmentFieldMeta,
} from 'erxes-api-shared/core-modules';
import { PROBABILITY, SALES_STATUSES } from '../../../constants';

const STAGES = 'sales:sales.stages';

export const SALES_DEAL_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  SegmentField.text({ key: 'name', label: 'Name' }),
  SegmentField.text({ key: 'number', label: 'Number' }),
  SegmentField.text({ key: 'description', label: 'Description' }),
  SegmentField.text({ key: 'priority', label: 'Priority' }),
  SegmentField.text({ key: 'parentId', label: 'Parent deal' }),

  SegmentField.static({
    key: 'status',
    label: 'Status',
    options: SALES_STATUSES.ALL,
  }),
  SegmentField.boolean({ key: 'isComplete', label: 'Is complete' }),

  SegmentField.component({
    key: 'stageId',
    label: 'Stage',
    component: 'dealStage',
  }),
  SegmentField.component({
    key: 'initialStageId',
    label: 'Initial stage',
    component: 'dealStage',
  }),

  SegmentField.number({ key: 'score', label: 'Score' }),
  SegmentField.number({ key: 'totalAmount', label: 'Total amount' }),
  SegmentField.number({
    key: 'unUsedTotalAmount',
    label: 'Unused total amount',
  }),
  SegmentField.number({ key: 'bothTotalAmount', label: 'Both total amount' }),

  SegmentField.date({ key: 'startDate', label: 'Start date' }),
  SegmentField.date({ key: 'closeDate', label: 'Close date' }),
  SegmentField.date({ key: 'stageChangedDate', label: 'Stage changed date' }),
  SegmentField.date({ key: 'createdAt', label: 'Created at' }),
  SegmentField.date({ key: 'updatedAt', label: 'Updated at' }),

  SegmentField.lookup({
    key: 'assignedUserIds',
    label: 'Assigned users',
    query: { name: 'users', labelField: 'email' },
  }),
  SegmentField.lookup({
    key: 'watchedUserIds',
    label: 'Watched users',
    query: { name: 'users', labelField: 'email' },
  }),
  SegmentField.lookup({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),
  SegmentField.lookup({
    key: 'productId',
    label: 'Product',
    path: 'productsData.productId',
    query: { name: 'products', labelField: 'name' },
  }),

  SegmentField.lookup({
    key: 'branchIds',
    label: 'Branches',
    query: { name: 'branchesMain', labelField: 'title' },
  }),
  SegmentField.lookup({
    key: 'departmentIds',
    label: 'Departments',
    query: { name: 'departmentsMain', labelField: 'title' },
  }),
  SegmentField.text({ key: 'labelIds', label: 'Labels' }),

  {
    key: 'pipelineId',
    label: 'Pipeline',
    operators: SEGMENT_ID_OPERATORS,
    kind: 'derived',
    dependsOn: [
      { fields: ['stageId'] },
      { contentType: STAGES, fields: ['pipelineId'], via: 'stageId' },
    ],
    input: 'text',
  },
  {
    key: 'boardId',
    label: 'Board',
    operators: SEGMENT_ID_OPERATORS,
    kind: 'derived',
    dependsOn: [
      { fields: ['stageId'] },
      { contentType: STAGES, fields: ['pipelineId'], via: 'stageId' },
    ],
    input: 'text',
  },
  {
    key: 'stageProbability',
    label: 'Stage probability',
    operators: SEGMENT_ID_OPERATORS,
    kind: 'derived',
    dependsOn: [
      { fields: ['stageId'] },
      { contentType: STAGES, fields: ['probability'], via: 'stageId' },
    ],
    input: 'select',
    source: 'static',
    options: PROBABILITY.ALL.map((probability) => ({
      value: probability,
      label: probability,
    })),
  },
];
