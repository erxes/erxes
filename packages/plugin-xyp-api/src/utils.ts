import fetch from 'node-fetch';
import { sendCommonMessage } from './messageBroker';
import { xypServiceData } from './models/definitions/xypdata';

import { nanoid } from 'nanoid';
import { IModels } from './connectionResolver';

/*
 * Mongoose field options wrapper
 */
export const field = (options) => {
  const { pkey, type, optional } = options;

  if (type === String && !pkey && !optional) {
    options.validate = /\S+/;
  }

  // TODO: remove
  if (pkey) {
    options.type = String;
    options.default = () => nanoid();
  }

  return options;
};

export const schemaWrapper = (schema) => {
  schema.add({ scopeBrandIds: [String] });

  return schema;
};

export const schemaHooksWrapper = (schema, _cacheKey: string) => {
  return schemaWrapper(schema);
};

export const convertToPropertyData = async (
  models: IModels,
  subdomain: string,
  doc: any,
) => {
  const customerId = doc.customerId;

  const customer = await sendCommonMessage({
    serviceName: 'contacts',
    action: 'customers.findOne',
    data: { _id: customerId },
    isRPC: true,
    defaultValue: null,
    subdomain,
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  try {
    const fields = await sendCommonMessage({
      subdomain,
      serviceName: 'forms',
      action: 'fields.find',
      data: {
        query: {
          contentType: 'contacts:customer',
          code: { $exists: true, $ne: '' },
        },
        projection: {
          groupId: 1,
          code: 1,
          _id: 1,
        },
      },
      isRPC: true,
      defaultValue: [],
    });

    const customFieldsData: any[] = customer.customFieldsData || [];

    const xyp = await models.XypData.findOne({
      contentType: 'contacts:customer',
      contentTypeId: customer._id,
    });

    if (!xyp) {
      return null;
    }

    const data = xyp.data;

    const serviceNames = data.map((x) => x.serviceName);
    const citizen = data.find(
      (x) => x.serviceName === 'WS100101_getCitizenIDCardInfo',
    );
    let customerMainFields = {};
    if (citizen) {
      customerMainFields = {
        lastName: citizen.data.lastname,
        firstName: citizen.data.firstname,
      };
    }

    const groups = await sendCommonMessage({
      subdomain,
      serviceName: 'forms',
      action: 'fieldsGroups.find',
      data: {
        query: {
          contentType: 'contacts:customer',
          code: { $in: serviceNames },
        },
        projection: {
          code: 1,
          _id: 1,
        },
      },
      isRPC: true,
      defaultValue: [],
    });
    const dataRow = {};

    for (const f of data) {
      for (const key in f.data) {
        dataRow[`${f.serviceName}.${key}`] = f.data[key];
      }
    }

    for (const f of fields) {
      const existingIndex = customFieldsData.findIndex(
        (c) => c.field === f._id,
      );
      if (dataRow[f.code]) {
        if (existingIndex !== -1) {
          // replace existing value
          customFieldsData[existingIndex].value = dataRow[f.code];
        } else {
          if (dataRow[f.code])
            customFieldsData.push({
              field: f._id,
              value: dataRow[f.code],
            });
        }
      }
    }

    await sendCommonMessage({
      serviceName: 'contacts',
      action: 'customers.updateCustomer',
      data: {
        _id: customerId,
        doc: {
          customFieldsData,
          ...customerMainFields,
        },
      },
      isRPC: true,
      subdomain,
    });

    return 'ok';
  } catch (e) {
    console.error('error ', e);
    throw new Error(e);
  }
};
