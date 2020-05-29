import { Fields } from '../../../db/models';
import { COMPANY_BASIC_INFOS, CUSTOMER_BASIC_INFOS, PRODUCT_BASIC_INFOS } from '../fileExporter/constants';

// Checking field names, All field names must be configured correctly
export const checkFieldNames = async (type: string, fields: string[]) => {
  let basicInfos = CUSTOMER_BASIC_INFOS;

  if (type === 'company') {
    basicInfos = COMPANY_BASIC_INFOS;
  }

  if (type === 'product') {
    basicInfos = PRODUCT_BASIC_INFOS;
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

    if (fieldName === 'ownerEmail') {
      property.name = 'ownerId';
      property.type = 'ownerEmail';
    }

    if (fieldName === 'tag') {
      property.name = 'tagIds';
      property.type = 'tag';
    }

    if (!property.type) {
      throw new Error(`Bad column name ${fieldName}`);
    }

    properties.push(property);
  }

  return properties;
};
