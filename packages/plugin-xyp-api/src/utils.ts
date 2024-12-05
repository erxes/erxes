import { sendCommonMessage, sendCoreMessage } from "./messageBroker";
import { IXypDataDocument } from "./models/definitions/xypdata";

import { nanoid } from 'nanoid';
import { IModels } from './connectionResolver';
import { ISyncRuleDocument } from './models/definitions/syncRule';

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
    options.default = () => nanoid();
  }

  return options;
};

export const schemaWrapper = schema => {
  schema.add({ scopeBrandIds: [String] });

  return schema;
};

export const schemaHooksWrapper = (schema, _cacheKey: string) => {
  return schemaWrapper(schema);
};

export const convertToPropertyData = async (
  models: IModels,
  subdomain: string,
  doc: any
) => {
  const customerId = doc.customerId;

  const customer = await sendCommonMessage({
    serviceName: "core",
    action: "customers.findOne",
    data: { _id: customerId },
    isRPC: true,
    defaultValue: null,
    subdomain
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  try {
    const fields = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: "fields.find",
      data: {
        query: {
          contentType: "core:customer",
          code: { $exists: true, $ne: "" }
        },
        projection: {
          groupId: 1,
          code: 1,
          _id: 1
        }
      },
      isRPC: true,
      defaultValue: []
    });

    const customFieldsData: any[] = customer.customFieldsData || [];

    const xyp = await models.XypData.findOne({
      contentType: "core:customer",
      contentTypeId: customer._id
    });

    if (!xyp) {
      return null;
    }

    const data = xyp.data;

    const serviceNames = data.map(x => x.serviceName);
    const citizen = data.find(
      x => x.serviceName === "WS100101_getCitizenIDCardInfo"
    );
    let customerMainFields = {};
    if (citizen) {
      customerMainFields = {
        lastName: citizen.data.lastname,
        firstName: citizen.data.firstname
      };
    }

    const groups = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: "fieldsGroups.find",
      data: {
        query: {
          contentType: "core:customer",
          code: { $in: serviceNames }
        },
        projection: {
          code: 1,
          _id: 1
        }
      },
      isRPC: true,
      defaultValue: []
    });
    const dataRow = {};

    for (const f of data) {
      for (const key in f.data) {
        dataRow[`${f.serviceName}.${key}`] = f.data[key];
      }
    }

    for (const f of fields) {
      const existingIndex = customFieldsData.findIndex(c => c.field === f._id);
      if (dataRow[f.code]) {
        if (existingIndex !== -1) {
          // replace existing value
          customFieldsData[existingIndex].value = dataRow[f.code];
        } else {
          if (dataRow[f.code])
            customFieldsData.push({
              field: f._id,
              value: dataRow[f.code]
            });
        }
      }
    }

    await sendCommonMessage({
      serviceName: "core",
      action: "customers.updateCustomer",
      data: {
        _id: customerId,
        doc: {
          customFieldsData,
          ...customerMainFields
        }
      },
      isRPC: true,
      subdomain
    });

    return "ok";
  } catch (e) {
    console.error("error ", e);
    throw new Error(e);
  }
};

const getObject = async (
  subdomain: string,
  type: string,
  doc: IXypDataDocument
) => {
  const { contentType, contentTypeId, customerId } = doc;
  if (type === "core:customer") {
    return await sendCoreMessage({
      subdomain,
      action: "customers.findOne",
      data: { _id: customerId },
      isRPC: true,
      defaultValue: {}
    });
  }
  if (type === "core:company") {
    return;
  }
  if (type === "core:product") {
    return;
  }
  if (type === "inbox:conversation") {
    return;
  }
  if (type === "core:device") {
    return;
  }
  if (type === "core:user") {
    return;
  }

  return;
};

const saveObject = async (subdomain, type, object, modifier) => {
  if (type === 'core:customer') {
    return await sendCoreMessage({
      subdomain,
      action: 'customers.updateOne',
      data: { selector: { _id: object._id }, modifier },
      isRPC: true,
      defaultValue: {}
    });
  }
}

export const syncData = async (subdomain: string, models: IModels, doc: IXypDataDocument) => {
  for (const docData of doc.data) {
    const { serviceName, data } = docData;
    if (!data) {
      continue;
    }

    const syncRules: ISyncRuleDocument[] = await models.SyncRules.find({ serviceName }).lean();
    if (!syncRules.length) {
      continue;
    }

    const syncRulesObjTypes = [...new Set(syncRules.map(sr => sr.objectType))];

    if (!syncRulesObjTypes.length) {
      continue;
    }

    for (const syncRulesObjType of syncRulesObjTypes) {
      const filteredSyncRules = syncRules.filter(sr => sr.serviceName === serviceName && sr.objectType === syncRulesObjType);
      const relObject = await getObject(subdomain, syncRulesObjType, doc);

      const fields = await sendCoreMessage({
        subdomain,
        action: 'fields.find',
        data: {
          query: {
            _id: { $in: filteredSyncRules.map(osr => osr.formField) }
          }
        },
        isRPC: true,
        defaultValue: []
      });

      const toUpdateData: any = { customFieldsData: relObject.customFieldsData };
      for (const field of fields) {
        const syncRule = filteredSyncRules.find(fsr => fsr.formField === field._id);

        const responseKey = syncRule?.responseKey || '';

        if (!responseKey) {
          continue;
        }

        if (field.isDefinedByErxes) {
          toUpdateData[field.type] = data[responseKey]
        } else {
          if (toUpdateData.customFieldsData.map(cfd => cfd.field).includes(field._id)) {
            toUpdateData.customFieldsData = toUpdateData.customFieldsData.filter(cfd => cfd.field !== field._id)
          }

          toUpdateData.customFieldsData.push({
            field: field._id,
            value: data[responseKey],
            stringValue: (data[responseKey] || '').toString(),
          })
        }

      }

      await saveObject(subdomain, syncRulesObjType, relObject, toUpdateData)
    }
  }
};
