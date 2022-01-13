import {
  Companies,
  Customers,
  Fields,
  FieldsGroups,
  Integrations,
  Products,
  Tags,
  Users
} from '../../../db/models';
import { IFieldGroup } from '../../../db/models/definitions/fields';
import { fetchElk } from '../../../elasticsearch';
import { EXTEND_FIELDS, FIELD_CONTENT_TYPES } from '../../constants';
import { getDocumentList } from '../../resolvers/mutations/cacheUtils';
import { findElk } from '../../resolvers/mutations/engageUtils';
import { getConfig, isUsingElk } from '../../utils';
import { BOARD_BASIC_INFOS } from '../fileExporter/constants';
import { custom, getPluginSchema } from './federationUtils';

const generateBasicInfosFromSchema = async (
  queSchema: any,
  namePrefix: string
) => {
  const queFields: string[] = [];

  // field definations
  const paths = queSchema.paths;

  for (const name of Object.keys(paths)) {
    const path = paths[name];

    const label = path.options.label;
    const type = path.instance;

    if (['String', 'Number', 'Date', 'Boolean'].includes(type) && label) {
      // add to fields list
      queFields.push(`${namePrefix}${name}`);
    }
  }

  return queFields;
};

export const getCustomFields = async (contentType: string) => {
  if (!isUsingElk()) {
    return Fields.find({
      contentType,
      isDefinedByErxes: false
    });
  }

  return findElk('fields', {
    bool: {
      must: [
        {
          match: {
            contentType
          }
        },
        {
          match: {
            isDefinedByErxes: false
          }
        }
      ]
    }
  });
};

// const getSegment = async (_id: string) => {
//   if (!isUsingElk()) {
//     return Segments.findOne({ _id });
//   }

//   const response = await fetchElk({
//     action: 'get',
//     index: 'segments',
//     body: null,
//     _id,
//     defaultValue: null
//   });

//   return response && { _id: response._id, ...response._source };
// };

const getFieldGroup = async (_id: string) => {
  if (!isUsingElk()) {
    return FieldsGroups.findOne({ _id });
  }
  const response = await fetchElk({
    action: 'get',
    index: 'fields_groups',
    body: null,
    _id,
    defaultValue: null
  });

  return response && { _id: response._id, ...response._source };
};

// Checking field names, all field names must be configured correctly
export const checkFieldNames = async (type: string, fields: string[]) => {
  const properties: any[] = [];
  let schema: any;
  let basicInfos: string[] = [];

  switch (type) {
    case 'company':
      schema = Companies.schema;
      break;

    case 'customer':
      schema = Customers.schema;
      break;

    case 'lead':
      schema = Customers.schema;
      break;

    case 'product':
      schema = Products.schema;
      break;

    case 'deal':
    case 'task':
    case 'ticket':
      basicInfos = BOARD_BASIC_INFOS;
      break;
  }

  if (schema) {
    basicInfos = [
      ...basicInfos,
      ...(await generateBasicInfosFromSchema(schema, ''))
    ];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        basicInfos = [
          ...basicInfos,
          ...(await generateBasicInfosFromSchema(path.schema, `${name}.`))
        ];
      }
    }
  }

  for (let fieldName of fields) {
    if (!fieldName) {
      continue;
    }

    fieldName = fieldName.trim();

    const property: { [key: string]: any } = {};

    const fieldObj = await Fields.findOne({
      text: fieldName,
      contentType: type === 'lead' ? 'customer' : type
    });

    // Collecting basic fields
    if (basicInfos.includes(fieldName)) {
      property.name = fieldName;
      property.type = 'basic';
    }

    // Collecting custom fields
    if (fieldObj) {
      property.type = 'customProperty';
      property.id = fieldObj._id;
    }

    if (fieldName === 'companiesPrimaryNames') {
      property.name = 'companyIds';
      property.type = 'companiesPrimaryNames';
    }

    if (fieldName === 'customersPrimaryEmails') {
      property.name = 'customerIds';
      property.type = 'customersPrimaryEmails';
    }

    if (fieldName === 'ownerEmail') {
      property.name = 'ownerId';
      property.type = 'ownerEmail';
    }

    if (fieldName === 'tag') {
      property.name = 'tagIds';
      property.type = 'tag';
    }

    if (fieldName === 'boardName') {
      property.name = 'boardId';
      property.type = 'boardName';
    }

    if (fieldName === 'pipelineName') {
      property.name = 'pipelineId';
      property.type = 'pipelineName';
    }

    if (fieldName === 'stageName') {
      property.name = 'stageId';
      property.type = 'stageName';
    }

    if (fieldName === 'pronoun') {
      property.name = 'pronoun';
      property.type = 'pronoun';
    }

    if (fieldName === 'categoryCode') {
      property.name = 'categoryCode';
      property.type = 'categoryCode';
    }

    if (fieldName === 'vendorCode') {
      property.name = 'vendorCode';
      property.type = 'vendorCode';
    }

    if (!property.type) {
      throw new Error(`Bad column name ${fieldName}`);
    }

    properties.push(property);
  }

  return properties;
};

export const getIntegrations = async () => {
  if (!isUsingElk()) {
    return Integrations.aggregate([
      {
        $project: {
          _id: 0,
          label: '$name',
          value: '$_id'
        }
      }
    ]);
  }

  const response = await fetchElk({
    action: 'search',
    index: 'integrations',
    body: {}
  });

  if (!response) {
    return [];
  }

  return response.hits.hits.map(hit => {
    return {
      value: hit._id,
      label: hit._source.name
    };
  });
};

export const generateUsersOptions = async (
  name: string,
  label: string,
  type: string
) => {
  const users = await getDocumentList('users', {});

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

export const generateProductsOptions = async (
  name: string,
  label: string,
  type: string
) => {
  const products = await getDocumentList('products', {});

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

export const generateConfigOptions = async (
  name: string,
  label: string,
  type: string,
  configCode: string
) => {
  const configs = (await getConfig(configCode)) || [];

  const options: Array<{ label: string; value: any }> = configs.map(item => ({
    value: item,
    label: item
  }));

  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectOptions: options
  };
};

const getTags = async (type: string) => {
  const tags = await Tags.aggregate([
    { $match: { type } },
    {
      $project: {
        _id: 0,
        label: '$name',
        value: '$_id'
      }
    }
  ]);

  return {
    _id: Math.random(),
    name: 'tagIds',
    label: 'Tag',
    type: 'tag',
    selectOptions: tags
  };
};

export const getFormFields = async (formId: string) => {
  if (!isUsingElk()) {
    return Fields.find({
      contentType: 'form',
      isDefinedByErxes: false,
      contentTypeId: formId
    });
  }

  return findElk('fields', {
    bool: {
      must: [
        {
          match: {
            contentType: 'form'
          }
        },
        {
          match: {
            isDefinedByErxes: false
          }
        },
        {
          match: {
            contentTypeId: formId
          }
        }
      ]
    }
  });
};

/*
 * Generates fields using given schema
 */
const generateFieldsFromSchema = async (queSchema: any, namePrefix: string) => {
  const fields: any = [];

  // field definitions
  const paths = queSchema.paths;

  const integrations = await getIntegrations();

  for (const name of Object.keys(paths)) {
    const path = paths[name];
    const label = path.options.label;
    const type = path.instance;

    const selectOptions =
      name === 'integrationId'
        ? integrations || []
        : path.options.selectOptions;

    if (['String', 'Number', 'Date', 'Boolean'].includes(type) && label) {
      // add to fields list
      fields.push({
        _id: Math.random(),
        name: `${namePrefix}${name}`,
        label,
        type: path.instance,
        selectOptions
      });
    }
  }

  return fields;
};

/**
 * Generates all field choices base on given kind.
 */
export const fieldsCombinedByContentType = async ({
  contentType,
  usageType,
  excludedNames,
  pipelineId,
  segmentId,
  formId,
  pluginName,
  pluginContentType
}: {
  contentType: string;
  usageType?: string;
  excludedNames?: string[];
  boardId?: string;
  segmentId?: string;
  pipelineId?: string;
  formId?: string;
  pluginName?: string;
  pluginContentType?: string;
}) => {
  console.log(pipelineId, segmentId);

  let schema: any;
  let extendFields: Array<{ name: string; label?: string }> = [];
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

  switch (contentType) {
    case FIELD_CONTENT_TYPES.COMPANY:
      schema = Companies.schema;
      break;

    case FIELD_CONTENT_TYPES.CUSTOMER:
      schema = Customers.schema;
      break;

    case 'user':
      schema = Users.schema;
      break;
  }

  if (pluginName && pluginContentType) {
    schema = await getPluginSchema(pluginName, pluginContentType);
  }

  if (schema) {
    // generate list using customer or company schema
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

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

  const customFields = await getCustomFields(contentType);

  // extend fields list using custom fields data
  for (const customField of customFields) {
    const group = await getFieldGroup(customField.groupId);

    if (
      group &&
      group.isVisible &&
      (customField.isVisibleDetail || customField.isVisibleDetail === undefined)
    ) {
      fields.push({
        _id: Math.random(),
        name: `customFieldsData.${customField._id}`,
        label: customField.text,
        options: customField.options,
        validation: customField.validation,
        type: customField.type
      });
    }
  }

  if (contentType === 'customer' && usageType) {
    extendFields = EXTEND_FIELDS.CUSTOMER;
  }

  if (
    contentType === 'customer' ||
    contentType === 'company' ||
    contentType === 'conversation'
  ) {
    const tags = await getTags(contentType);
    fields = [...fields, ...[tags]];

    if (contentType === 'customer') {
      const integrations = await getIntegrations();

      fields.push({
        _id: Math.random(),
        name: 'relatedIntegrationIds',
        label: 'Related integration',
        selectOptions: integrations
      });
    }
  }

  const pluginsCustomFields = await custom(pluginName, pluginContentType);

  fields = [...fields, ...pluginsCustomFields];

  for (const extendField of extendFields) {
    fields.push({
      _id: Math.random(),
      ...extendField
    });
  }

  if (['visitor', 'lead', 'customer', 'company'].includes(contentType)) {
    const ownerOptions = await generateUsersOptions('ownerId', 'Owner', 'user');

    fields = [...fields, ownerOptions];
  }

  if (contentType === 'form_submission' && formId) {
    const formFieldsValues = await getFormFields(formId);
    const form = await Integrations.findOne({ formId });

    for (const formField of formFieldsValues) {
      fields.push({
        _id: Math.random(),
        name: formField._id,
        group: form ? form.name : 'Fields',
        label: formField.text,
        options: formField.options,
        validation: formField.validation,
        type: formField.type
      });
    }
  }

  if (
    (contentType === 'company' || contentType === 'customer') &&
    (!usageType || usageType === 'export')
  ) {
    const aggre = await fetchElk({
      action: 'search',
      index: contentType === 'company' ? 'companies' : 'customers',
      body: {
        size: 0,
        _source: false,
        aggs: {
          trackedDataKeys: {
            nested: {
              path: 'trackedData'
            },
            aggs: {
              fieldKeys: {
                terms: {
                  field: 'trackedData.field',
                  size: 10000
                }
              }
            }
          }
        }
      },
      defaultValue: { aggregations: { trackedDataKeys: {} } }
    });

    const aggregations = aggre.aggregations || { trackedDataKeys: {} };
    const buckets = (aggregations.trackedDataKeys.fieldKeys || { buckets: [] })
      .buckets;

    for (const bucket of buckets) {
      fields.push({
        _id: Math.random(),
        name: `trackedData.${bucket.key}`,
        label: bucket.key
      });
    }
  }

  return fields.filter(field => !(excludedNames || []).includes(field.name));
};

export const getBoardsAndPipelines = (doc: IFieldGroup) => {
  const boardIds: string[] = [];
  const pipelineIds: string[] = [];

  const boardsPipelines = doc.boardsPipelines || [];

  for (const item of boardsPipelines) {
    boardIds.push(item.boardId || '');

    const pipelines = item.pipelineIds || [];

    for (const pipelineId of pipelines) {
      pipelineIds.push(pipelineId);
    }
  }
  doc.boardIds = boardIds;
  doc.pipelineIds = pipelineIds;

  return doc;
};
