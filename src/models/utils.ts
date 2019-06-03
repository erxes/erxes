import * as Random from 'meteor-random';
import { COMPANY_BASIC_INFOS } from '../../data/constants';
import { Fields } from './';
import { CUSTOMER_BASIC_INFOS } from './definitions/constants';

/*
 * Mongoose field options wrapper
 */
export const field = options => {
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  // TODO: remove
  if (pkey) {
    options.type = String;
    options.default = () => Random.id();
  }

  return options;
};

// Checking field names, All field names must be configured correctly
export const checkFieldNames = async (type: string, fields: string[]) => {
  let basicInfos = CUSTOMER_BASIC_INFOS;

  if (type === 'company') {
    basicInfos = COMPANY_BASIC_INFOS;
  }

  const properties: any[] = [];

  for (const fieldName of fields) {
    const property: { [key: string]: any } = {
      isCustomField: false,
    };

    const fieldObj = await Fields.findOne({ text: fieldName });

    // Collecting basic fields
    if (basicInfos.includes(fieldName)) {
      property.name = fieldName;
    }

    // Collecting custom fields
    if (fieldObj) {
      property.isCustomField = true;
      property.id = fieldObj._id;
    }

    properties.push(property);

    if (!basicInfos.includes(fieldName) && !fieldObj) {
      throw new Error('Bad column name');
    }
  }

  return properties;
};
