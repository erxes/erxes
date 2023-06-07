import { generateFieldsFromSchema } from '@erxes/api-utils/src/fieldUtils';
import { generateModels, IModels } from './connectionResolver';
import {
  BOARD_ITEM_EXPORT_EXTENDED_FIELDS,
  BOARD_ITEM_EXTENDED_FIELDS
} from './constants';
import {
  sendCoreMessage,
  sendProductsMessage,
  sendSegmentsMessage
} from './messageBroker';

const generateProductsOptions = async (
  subdomain: string,
  name: string,
  label: string,
  type: string
) => {
  const products = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: {
      query: {}
    },
    isRPC: true,
    defaultValue: []
  });

  const options: Array<{ label: string; value: any }> = products.map(
    product => ({
      value: product._id,
      label: `${product.code} - ${product.name}`
    })
  );

  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectOptions: options
  };
};

const generateUsersOptions = async (
  subdomain: string,
  name: string,
  label: string,
  type: string
) => {
  const users = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {}
    },
    isRPC: true,
    defaultValue: []
  });

  const options: Array<{ label: string; value: any }> = users.map(user => ({
    value: user._id,
    label: user.username || user.email || ''
  }));

  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectOptions: options
  };
};

const getStageOptions = async (models: IModels, pipelineId) => {
  const stages = await models.Stages.find({ pipelineId });
  const options: Array<{ label: string; value: any }> = [];

  for (const stage of stages) {
    options.push({
      value: stage._id,
      label: stage.name || ''
    });
  }

  return {
    _id: Math.random(),
    name: 'stageId',
    label: 'Stage',
    type: 'stage',
    selectOptions: options
  };
};

const getPipelineLabelOptions = async (models: IModels, pipelineId) => {
  const labels = await models.PipelineLabels.find({ pipelineId });
  const options: Array<{ label: string; value: any }> = [];

  for (const label of labels) {
    options.push({
      value: label._id,
      label: label.name
    });
  }

  return {
    _id: Math.random(),
    name: 'labelIds',
    label: 'Labels',
    type: 'label',
    selectOptions: options
  };
};

export const generateFields = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);
  const { type, config = {}, segmentId, usageType } = data;

  const { pipelineId } = config;

  let schema: any;
  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  switch (type) {
    case 'deal':
      schema = models.Deals.schema;
      break;
    case 'purchase':
      schema = models.Purchases.schema;
      break;
    case 'task':
      schema = models.Tasks.schema;
      break;

    case 'ticket':
      schema = models.Tickets.schema;
      break;
  }

  if (usageType && usageType === 'import') {
    fields = BOARD_ITEM_EXTENDED_FIELDS;
  }

  if (usageType && usageType === 'export') {
    fields = BOARD_ITEM_EXPORT_EXTENDED_FIELDS;
  }

  if (schema) {
    // generate list using customer or company schema
    fields = [...(await generateFieldsFromSchema(schema, '')), ...fields];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`))
        ];
      }
    }
  }

  const createdByOptions = await generateUsersOptions(
    subdomain,
    'userId',
    'Created by',
    'user'
  );

  const modifiedByOptions = await generateUsersOptions(
    subdomain,
    'modifiedBy',
    'Modified by',
    'user'
  );

  const assignedUserOptions = await generateUsersOptions(
    subdomain,
    'assignedUserIds',
    'Assigned to',
    'user'
  );

  const watchedUserOptions = await generateUsersOptions(
    subdomain,
    'watchedUserIds',
    'Watched users',
    'user'
  );

  fields = [
    ...fields,
    ...[
      createdByOptions,
      modifiedByOptions,
      assignedUserOptions,
      watchedUserOptions
    ]
  ];

  if (type === 'deal' || (type === 'purchase' && usageType !== 'export')) {
    const productOptions = await generateProductsOptions(
      subdomain,
      'productsData.productId',
      'Product',
      'product'
    );

    fields = [...fields, ...[productOptions, assignedUserOptions]];
  }

  if (type === 'deal' || (type === 'purchase' && usageType === 'export')) {
    const extendFieldsExport = [
      { _id: Math.random(), name: 'productsData.name', label: 'Product Name' },
      { _id: Math.random(), name: 'productsData.code', label: 'Product Code' },
      { _id: Math.random(), name: 'productsData.branch', label: 'Branch' },
      {
        _id: Math.random(),
        name: 'productsData.department',
        label: 'Department'
      }
    ];

    fields = [...fields, ...extendFieldsExport];
  }

  if (usageType === 'export') {
    const extendExport = [
      { _id: Math.random(), name: 'boardId', label: 'Board' },
      { _id: Math.random(), name: 'pipelineId', label: 'Pipeline' },
      { _id: Math.random(), name: 'labelIds', label: 'Label' },
      { _id: Math.random(), name: 'branchIds', label: 'Branch' },
      { _id: Math.random(), name: 'departmentIds', label: 'Department' }
    ];

    fields = [...fields, ...extendExport];
  }

  if (segmentId || pipelineId) {
    const segment = segmentId
      ? await sendSegmentsMessage({
          subdomain,
          action: 'findOne',
          data: { _id: segmentId },
          isRPC: true
        })
      : null;

    const labelOptions = await getPipelineLabelOptions(
      models,
      pipelineId || (segment ? segment.pipelineId : null)
    );

    const stageOptions = await getStageOptions(
      models,
      pipelineId || (segment ? segment.pipelineId : null)
    );

    fields = [...fields, stageOptions, labelOptions];
  } else {
    const stageOptions = {
      _id: Math.random(),
      name: 'stageId',
      label: 'Stage',
      type: 'stage'
    };

    fields = [...fields, stageOptions];
  }

  return fields;
};
