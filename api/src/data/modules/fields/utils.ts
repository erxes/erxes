import {
  Companies,
  Customers,
  Fields,
  FieldsGroups,
  Integrations,
  Products,
  Tags
} from '../../../db/models';
import { fetchElk } from '../../../elasticsearch';
import { EXTEND_FIELDS, FIELD_CONTENT_TYPES } from '../../constants';
import { BOARD_BASIC_INFOS } from '../fileExporter/constants';

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

    if (!property.type) {
      throw new Error(`Bad column name ${fieldName}`);
    }

    properties.push(property);
  }

  return properties;
};

const getIntegrations = async () => {
  return Integrations.aggregate([
    {
      $project: {
        _id: 0,
        label: '$name',
        value: '$_id'
      }
    }
  ]);
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
  excludedNames
}: {
  contentType: string;
  usageType?: string;
  excludedNames?: string[];
}) => {
  let schema: any;
  let extendFields: Array<{ name: string; label?: string }> = [];
  let fields: Array<{
    _id: number;
    name: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
  }> = [];

  switch (contentType) {
    case FIELD_CONTENT_TYPES.COMPANY:
      schema = Companies.schema;
      break;

    case FIELD_CONTENT_TYPES.PRODUCT:
      schema = Products.schema;
      extendFields = EXTEND_FIELDS.PRODUCT;

      break;

    case FIELD_CONTENT_TYPES.CUSTOMER:
      schema = Customers.schema;
      break;
  }

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

  const customFields = await Fields.find({
    contentType
  });

  // extend fields list using custom fields data
  for (const customField of customFields) {
    const group = await FieldsGroups.findOne({ _id: customField.groupId });

    if (group && group.isVisible && customField.isVisible) {
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

  if (contentType === 'customer' || contentType === 'company') {
    const tags = await getTags(contentType);
    fields = [...fields, ...[tags]];
  }

  for (const extendField of extendFields) {
    fields.push({
      _id: Math.random(),
      ...extendField
    });
  }

  if (
    (contentType === 'company' || contentType === 'customer') &&
    (!usageType || usageType === 'export')
  ) {
    const aggre = await fetchElk(
      'search',
      contentType === 'company' ? 'companies' : 'customers',
      {
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
      '',
      { aggregations: { trackedDataKeys: {} } }
    );

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
