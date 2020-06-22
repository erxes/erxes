import { Fields } from '../../../db/models';
import {
  BOARD_BASIC_INFOS,
  COMPANY_BASIC_INFOS,
  CUSTOMER_BASIC_INFOS,
  PRODUCT_BASIC_INFOS,
} from '../fileExporter/constants';

// Checking field names, all field names must be configured correctly
export const checkFieldNames = async (type: string, fields: string[]) => {
  let basicInfos: string[] = [];

  switch (type) {
    case 'company':
      basicInfos = COMPANY_BASIC_INFOS;
      break;
    case 'customer':
      basicInfos = CUSTOMER_BASIC_INFOS;
      break;
    case 'product':
      basicInfos = PRODUCT_BASIC_INFOS;
      break;
    case 'deal':
    case 'task':
    case 'ticket':
      basicInfos = BOARD_BASIC_INFOS;
      break;
  }

  const properties: any[] = [];

  for (let fieldName of fields) {
    if (!fieldName) {
      continue;
    }

    fieldName = fieldName.trim();

    const property: { [key: string]: any } = {};

    const fieldObj = await Fields.findOne({ text: fieldName, contentType: type });

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
