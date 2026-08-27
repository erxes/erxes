import {
  booleanField,
  componentField,
  dateField,
  lookupField,
  numberField,
  SEGMENT_ID_OPERATORS,
  SegmentFieldMeta,
  staticField,
  textField,
} from 'erxes-api-shared/core-modules';
import { PROBABILITY, SALES_STATUSES } from '../../../constants';

/**
 * Filterable deal fields.
 *
 * Declared per field rather than derived from the automation output, because
 * the two answer different questions: an automation variable exists to be
 * copied into an action, a segment field to be filtered on. Custom properties
 * are not listed here - they are tenant data and resolve at runtime.
 */

export const SALES_DEAL_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  textField({ key: 'name', label: 'Name' }),
  textField({ key: 'number', label: 'Number' }),
  textField({ key: 'description', label: 'Description' }),
  textField({ key: 'priority', label: 'Priority' }),
  // No picker exists for a parent deal yet, so this stays a plain id field.
  textField({ key: 'parentId', label: 'Parent deal' }),

  staticField({ key: 'status', label: 'Status', options: SALES_STATUSES.ALL }),
  booleanField({ key: 'isComplete', label: 'Is complete' }),

  componentField({ key: 'stageId', label: 'Stage', component: 'dealStage' }),
  componentField({
    key: 'initialStageId',
    label: 'Initial stage',
    component: 'dealStage',
  }),

  numberField({ key: 'score', label: 'Score' }),
  // Written by the deal mutations alongside `productsData`, and indexed, so it
  // is read off the document rather than recomputed here.
  numberField({ key: 'totalAmount', label: 'Total amount' }),
  numberField({ key: 'unUsedTotalAmount', label: 'Unused total amount' }),
  numberField({ key: 'bothTotalAmount', label: 'Both total amount' }),

  dateField({ key: 'startDate', label: 'Start date' }),
  dateField({ key: 'closeDate', label: 'Close date' }),
  dateField({ key: 'stageChangedDate', label: 'Stage changed date' }),
  dateField({ key: 'createdAt', label: 'Created at' }),
  dateField({ key: 'updatedAt', label: 'Updated at' }),

  lookupField({
    key: 'assignedUserIds',
    label: 'Assigned users',
    query: { name: 'users', labelField: 'email' },
  }),
  lookupField({
    key: 'watchedUserIds',
    label: 'Watched users',
    query: { name: 'users', labelField: 'email' },
  }),
  lookupField({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),
  lookupField({
    key: 'productId',
    label: 'Product',
    path: 'productsData.productId',
    query: { name: 'products', labelField: 'name' },
  }),

  // `branches`, `departments` and `salesPipelineLabels` do not take the cursor
  // arguments the generic select needs, so these stay plain id fields until
  // each gets a `propertyInputs` component.
  textField({ key: 'branchIds', label: 'Branches' }),
  textField({ key: 'departmentIds', label: 'Departments' }),
  textField({ key: 'labelIds', label: 'Labels' }),

  // Derived: a deal stores only `stageId`; board, pipeline and probability all
  // hang off the stage. The migration turned the old hidden `config.boardId`
  // and `config.pipelineId` filters into conditions on these two, so they carry
  // 860 conditions between them.
  {
    key: 'pipelineId',
    label: 'Pipeline',
    operators: SEGMENT_ID_OPERATORS,
    kind: 'derived',
    dependsOn: [{ fields: ['stageId'] }],
    input: 'text',
  },
  {
    key: 'boardId',
    label: 'Board',
    operators: SEGMENT_ID_OPERATORS,
    kind: 'derived',
    dependsOn: [{ fields: ['stageId'] }],
    input: 'text',
  },
  {
    key: 'stageProbability',
    label: 'Stage probability',
    operators: SEGMENT_ID_OPERATORS,
    kind: 'derived',
    dependsOn: [{ fields: ['stageId'] }],
    input: 'select',
    source: 'static',
    options: PROBABILITY.ALL.map((probability) => ({
      value: probability,
      label: probability,
    })),
  },
];
