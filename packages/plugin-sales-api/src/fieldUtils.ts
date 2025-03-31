import { generateFieldsFromSchema } from '@erxes/api-utils/src/fieldUtils';
import { generateModels, IModels } from './connectionResolver';
import {
  BOARD_ITEM_EXPORT_EXTENDED_FIELDS,
  BOARD_ITEM_EXTENDED_FIELDS,
} from './constants';
import { sendCoreMessage } from './messageBroker';

const generateProductsOptions = async (
  name: string,
  label: string,
  type: string
) => {
  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectionConfig: {
      queryName: 'products',
      labelField: 'name',
    },
  };
};

const generateProductsCategoriesOptions = async (
  name: string,
  label: string,
  type: string
) => {
  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectionConfig: {
      queryName: 'productCategories',
      labelField: 'name',
    },
  };
};

const generateContactsOptions = async (
  name: string,
  label: string,
  type: string,
  selectionConfig?: any
) => {
  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectionConfig: {
      ...selectionConfig,
      labelField: 'primaryEmail',
      multi: true,
    },
  };
};

const generateUsersOptions = async (
  name: string,
  label: string,
  type: string,
  selectionConfig: any
) => {
  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectionConfig: {
      ...selectionConfig,
      queryName: 'users',
      labelField: 'email',
    },
  };
};

const generateStructuresOptions = async (
  name: string,
  label: string,
  type: string,
  selectionConfig?: any
) => {
  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectionConfig: {
      ...selectionConfig,
      labelField: 'title',
    },
  };
};

const getStageOptions = async (models: IModels, pipelineId) => {
  const stages = await models.Stages.find({ pipelineId });
  const options: Array<{ label: string; value: any }> = [];

  for (const stage of stages) {
    options.push({
      value: stage._id,
      label: stage.name || '',
    });
  }

  return {
    _id: Math.random(),
    name: 'stageId',
    label: 'Stage',
    type: 'stage',
    selectOptions: options,
  };
};

const getPipelineLabelOptions = async (models: IModels, pipelineId) => {
  const labels = await models.PipelineLabels.find({ pipelineId });
  const options: Array<{ label: string; value: any }> = [];

  for (const label of labels) {
    options.push({
      value: label._id,
      label: label.name,
    });
  }

  return {
    _id: Math.random(),
    name: 'labelIds',
    label: 'Labels',
    type: 'label',
    selectOptions: options,
  };
};

const generateTagOptions = async (
  subdomain,
  name: string,
  label: string,
  type: string
) => {
  const options = await sendCoreMessage({
    subdomain,
    action: 'tagFind',
    data: {
      type: 'sales:deal',
    },
    isRPC: true,
    defaultValue: [],
  });

  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectOptions: options.map(({ _id, name }) => ({
      value: _id,
      label: name,
    })),
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
          ...(await generateFieldsFromSchema(path.schema, `${name}.`)),
        ];
      }
    }
  }

  const createdByOptions = await generateUsersOptions(
    'userId',
    'Created by',
    'user',
    { multi: false }
  );

  const modifiedByOptions = await generateUsersOptions(
    'modifiedBy',
    'Modified by',
    'user',
    { multi: false }
  );

  const assignedUserOptions = await generateUsersOptions(
    'assignedUserIds',
    'Assigned to',
    'user',
    { multi: true }
  );

  const watchedUserOptions = await generateUsersOptions(
    'watchedUserIds',
    'Watched users',
    'user',
    { multi: true }
  );

  const customersOptions = await generateContactsOptions(
    'customers',
    'Customers',
    'contact',
    {
      queryName: 'customers',
    }
  );

  const companiesOptions = await generateContactsOptions(
    'companies',
    'Companies',
    'contact',
    {
      queryName: 'companies',
    }
  );

  const branchesOptions = await generateStructuresOptions(
    'branchIds',
    'Branches',
    'structure',
    { queryName: 'branches' }
  );

  const departmentsOptions = await generateStructuresOptions(
    'departmentIds',
    'Departments',
    'structure',
    { queryName: 'branches' }
  );

  const tagsOptions = await generateTagOptions(
    subdomain,
    'tagIds',
    'Tags',
    'tags'
  );

  fields = [
    ...fields,
    ...[
      createdByOptions,
      modifiedByOptions,
      assignedUserOptions,
      watchedUserOptions,
      customersOptions,
      companiesOptions,
      branchesOptions,
      departmentsOptions,
      tagsOptions,
    ],
  ];

  if (type === 'deal' && usageType !== 'export') {
    const productOptions = await generateProductsOptions(
      'productsData.productId',
      'Product',
      'product'
    );

    const productsCategoriesOptions = await generateProductsCategoriesOptions(
      'productsData.categoryId',
      'Product Categories',
      'select'
    );

    fields = [
      ...fields,
      ...[productOptions, productsCategoriesOptions, assignedUserOptions],
    ];
  }

  if (type === 'deal' && usageType === 'export') {
    const extendFieldsExport = [
      { _id: Math.random(), name: 'productsData.name', label: 'Product Name' },
      { _id: Math.random(), name: 'productsData.code', label: 'Product Code' },
      { _id: Math.random(), name: 'productsData.branch', label: 'Branch' },
      {
        _id: Math.random(),
        name: 'productsData.department',
        label: 'Department',
      },
    ];

    fields = [...fields, ...extendFieldsExport];
  }

  if (usageType === 'export') {
    const extendExport = [
      { _id: Math.random(), name: 'boardId', label: 'Board' },
      { _id: Math.random(), name: 'pipelineId', label: 'Pipeline' },
      { _id: Math.random(), name: 'labelIds', label: 'Label' },
    ];

    fields = [...fields, ...extendExport];
  }

  if (segmentId || pipelineId) {
    const segment = segmentId
      ? await sendCoreMessage({
          subdomain,
          action: 'segmentFindOne',
          data: { _id: segmentId },
          isRPC: true,
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
      type: 'stage',
    };

    fields = [...fields, stageOptions];
  }

  return fields;
};
