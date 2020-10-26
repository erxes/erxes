import { Companies, Customers, Fields, Products } from '../../../db/models';
import { BOARD_BASIC_INFOS } from '../fileExporter/constants';

const generateBasicInfosFromSchema = async (queSchema: any, namePrefix: string) => {
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
    basicInfos = [...basicInfos, ...(await generateBasicInfosFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        basicInfos = [...basicInfos, ...(await generateBasicInfosFromSchema(path.schema, `${name}.`))];
      }
    }
  }

  for (let fieldName of fields) {
    if (!fieldName) {
      continue;
    }

    fieldName = fieldName.trim();

    const property: { [key: string]: any } = {};

    const fieldObj = await Fields.findOne({ text: fieldName, contentType: type === 'lead' ? 'customer' : type });

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

    if (!property.type) {
      throw new Error(`Bad column name ${fieldName}`);
    }

    properties.push(property);
  }

  return properties;
};
