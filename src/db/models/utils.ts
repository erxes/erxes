import * as Random from 'meteor-random';
import { COMPANY_BASIC_INFOS } from '../../data/constants';
import { Fields } from './';
import { IOrderInput } from './definitions/boards';
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

export const updateOrder = async (collection: any, orders: IOrderInput[], stageId?: string) => {
  if (orders.length === 0) {
    return [];
  }

  const ids: string[] = [];
  const bulkOps: Array<{
    updateOne: {
      filter: { _id: string };
      update: { stageId?: string; order: number };
    };
  }> = [];

  for (const { _id, order } of orders) {
    ids.push(_id);

    const selector: { order: number; stageId?: string } = { order };

    if (stageId) {
      selector.stageId = stageId;
    }

    bulkOps.push({
      updateOne: {
        filter: { _id },
        update: selector,
      },
    });
  }

  if (bulkOps) {
    await collection.bulkWrite(bulkOps);
  }

  return collection.find({ _id: { $in: ids } }).sort({ order: 1 });
};

export const changeCustomer = async (collection: any, newCustomerId: string, oldCustomerIds: string[]) => {
  if (oldCustomerIds) {
    await collection.updateMany(
      { customerIds: { $in: oldCustomerIds } },
      { $addToSet: { customerIds: newCustomerId } },
    );
    await collection.updateMany(
      { customerIds: { $in: oldCustomerIds } },
      { $pullAll: { customerIds: oldCustomerIds } },
    );
  }

  return collection.find({ customerIds: { $in: oldCustomerIds } });
};

export const changeCompany = async (collection: any, newCompanyId: string, oldCompanyIds: string[]) => {
  if (oldCompanyIds) {
    await collection.updateMany({ companyIds: { $in: oldCompanyIds } }, { $addToSet: { companyIds: newCompanyId } });

    await collection.updateMany({ companyIds: { $in: oldCompanyIds } }, { $pullAll: { companyIds: oldCompanyIds } });
  }

  return collection.find({ customerIds: { $in: oldCompanyIds } });
};
