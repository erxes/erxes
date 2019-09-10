import { Conformities, Fields } from '../../../db/models';
import { COMPANY_BASIC_INFOS, CUSTOMER_BASIC_INFOS } from '../../constants';

// Checking field names, All field names must be configured correctly
export const checkFieldNames = async (type: string, fields: string[]) => {
  let basicInfos = CUSTOMER_BASIC_INFOS;

  if (type === 'company') {
    basicInfos = COMPANY_BASIC_INFOS;
  }

  const properties: any[] = [];

  for (const fieldName of fields) {
    const property: { [key: string]: any } = {};

    const fieldObj = await Fields.findOne({ text: fieldName });

    // Collecting basic fields
    if (basicInfos.includes(fieldName)) {
      property.name = fieldName;
      property.type = 'basic';
    }

    // Collecting messengerData.customData fields
    if (fieldName.startsWith('messengerData.customData')) {
      property.name = fieldName;
      property.type = 'customData';
    }

    // Collecting custom fields
    if (fieldObj) {
      property.type = 'customProperty';
      property.id = fieldObj._id;
    }

    if (!property.type) {
      throw new Error('Bad column name');
    }

    properties.push(property);
  }

  return properties;
};

export const conformityFilterUtils = async (baseQuery, params, relType) => {
  if (params.conformityMainType && params.conformityMainTypeId) {
    if (params.conformityIsRelated) {
      const relTypeIds = await Conformities.relatedConformity({
        mainType: params.conformityMainType || '',
        mainTypeId: params.conformityMainTypeId || '',
        relType,
      });

      baseQuery = { _id: { $in: relTypeIds || [] } };
    }

    if (params.conformityIsSaved) {
      const relTypeIds = await Conformities.savedConformity({
        mainType: params.conformityMainType || '',
        mainTypeId: params.conformityMainTypeId || '',
        relType,
      });

      baseQuery = { _id: { $in: relTypeIds || [] } };
    }
  }
  return baseQuery;
};
