import { IUserDocument } from '@erxes/api-utils/src/types';
import { generateModels, IModels } from './connectionResolver';
import { IMPORT_EXPORT_TYPES, MODULE_NAMES } from './constants';
import {
  fetchSegment,
  sendCoreMessage,
  sendFormsMessage,
  sendInboxMessage,
  sendTagsMessage
} from './messageBroker';
import { ICompanyDocument } from './models/definitions/companies';
import { ICustomerDocument } from './models/definitions/customers';
import * as moment from 'moment';

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const { contentType, segmentData, page, perPage } = query;

  const type = contentType.split(':')[1];
  const skip = (page - 1) * perPage;

  let data: any[] = [];

  const contactsFilter: any = {};

  if (segmentData.conditions) {
    const itemIds = await fetchSegment(
      subdomain,
      '',
      { page, perPage },
      segmentData
    );

    contactsFilter._id = { $in: itemIds };
  }

  switch (type) {
    case MODULE_NAMES.COMPANY:
      if (!segmentData) {
        data = await models.Companies.find(contactsFilter)
          .skip(skip)
          .limit(perPage)
          .lean();
      }

      data = await models.Companies.find(contactsFilter).lean();

      break;
    case 'lead':
      if (!segmentData) {
        data = await models.Customers.find(contactsFilter)
          .skip(skip)
          .limit(perPage)
          .lean();
      }

      data = await models.Customers.find(contactsFilter).lean();

      break;
    case 'visitor':
      if (!segmentData) {
        data = await models.Customers.find(contactsFilter)
          .skip(skip)
          .limit(perPage)
          .lean();
      }

      data = await models.Customers.find(contactsFilter).lean();

      break;
    case MODULE_NAMES.CUSTOMER:
      if (!segmentData) {
        data = await models.Customers.find(contactsFilter)
          .skip(skip)
          .limit(perPage)
          .lean();
      }

      data = await models.Customers.find(contactsFilter).lean();

      break;
  }

  return data;
};

const prepareDataCount = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any> => {
  const { contentType, segmentData } = query;

  const type = contentType.split(':')[1];

  let data = 0;

  const contactsFilter: any = {};

  if (segmentData.conditions) {
    const itemIds = await fetchSegment(
      subdomain,
      '',
      { scroll: true, page: 1, perPage: 10000 },
      segmentData
    );

    contactsFilter._id = { $in: itemIds };
  }

  switch (type) {
    case MODULE_NAMES.COMPANY:
      data = await models.Companies.find(contactsFilter).count();

      break;
    case 'lead':
      data = await models.Customers.find(contactsFilter).count();

      break;
    case 'visitor':
      data = await models.Customers.find(contactsFilter).count();

      break;
    case MODULE_NAMES.CUSTOMER:
      data = await models.Customers.find(contactsFilter).count();
      break;
  }

  return data;
};

const getCustomFieldsData = async (item, fieldId) => {
  let value;

  if (item.customFieldsData && item.customFieldsData.length > 0) {
    for (const customFeild of item.customFieldsData) {
      if (customFeild.field === fieldId) {
        value = customFeild.value;

        if (Array.isArray(value)) {
          value = value.join(', ');
        }

        return { value };
      }
    }
  }

  return { value };
};

const getTrackedData = async (item, fieldname) => {
  let value;

  if (item.trackedData && item.trackedData.length > 0) {
    for (const data of item.trackedData) {
      if (data.field === fieldname) {
        value = data.value;

        if (Array.isArray(value)) {
          value = value.join(', ');
        }

        return { value };
      }
    }
  }

  return { value };
};

export const fillValue = async (
  models: IModels,
  subdomain: string,
  column: string,
  item: any
): Promise<string> => {
  let value = item[column];

  switch (column) {
    case 'createdAt':
      value = moment(value).format('YYYY-MM-DD');
      break;

    case 'modifiedAt':
      value = moment(value).format('YYYY-MM-DD');

      break;

    // customer fields

    case 'emails':
      value = (item.emails || []).join(', ');
      break;
    case 'phones':
      value = (item.phones || []).join(', ');
      break;
    case 'mergedIds':
      const customers: ICustomerDocument[] | null = await models.Customers.find(
        {
          _id: { $in: item.mergedIds || [] }
        }
      );

      value = customers
        .map(cus => cus.firstName || cus.primaryEmail)
        .join(', ');

      break;
    // company fields
    case 'names':
      value = (item.names || []).join(', ');

      break;
    case 'parentCompanyId':
      const parent: ICompanyDocument | null = await models.Companies.findOne({
        _id: item.parentCompanyId
      });

      value = parent ? parent.primaryName : '';

      break;

    case 'tag':
      const tags = await sendTagsMessage({
        subdomain,
        action: 'find',
        data: {
          _id: { $in: item.tagIds || [] }
        },
        isRPC: true,
        defaultValue: []
      });

      let tagNames = '';

      for (const tag of tags) {
        tagNames = tagNames.concat(tag.name, ', ');
      }

      value = tags ? tagNames : '-';

      break;

    case 'relatedIntegrationIds':
      const integration = await sendInboxMessage({
        subdomain,
        action: 'integrations.findOne',
        data: { _id: item.integrationId || [] },
        isRPC: true,
        defaultValue: []
      });

      value = integration ? integration.name : '-';

      break;

    case 'ownerEmail':
      const owner: IUserDocument | null = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          _id: item.ownerId
        },
        isRPC: true
      });

      value = owner ? owner.email : '-';

      break;

    default:
      break;
  }

  return value || '-';
};

export default {
  importExportTypes: IMPORT_EXPORT_TYPES,

  prepareExportData: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { columnsConfig } = data;

    let totalCount = 0;
    const headers = [] as any;
    const excelHeader = [] as any;

    try {
      const results = await prepareDataCount(models, subdomain, data);

      totalCount = results;

      for (const column of columnsConfig) {
        if (column.startsWith('customFieldsData')) {
          const fieldId = column.split('.')[1];
          const field = await sendFormsMessage({
            subdomain,
            action: 'fields.findOne',
            data: {
              query: {
                _id: fieldId
              }
            },
            isRPC: true
          });

          headers.push(`customFieldsData.${field.text}.${fieldId}`);
        } else {
          headers.push(column);
        }
      }

      for (const header of headers) {
        if (header.startsWith('customFieldsData')) {
          excelHeader.push(header.split('.')[1]);
        } else {
          excelHeader.push(header);
        }
      }
    } catch (e) {
      return {
        error: e.message
      };
    }
    return { totalCount, excelHeader };
  },

  getExportDocs: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { columnsConfig } = data;

    const docs = [] as any;
    const headers = [] as any;

    try {
      const results = await prepareData(models, subdomain, data);

      for (const column of columnsConfig) {
        if (column.startsWith('customFieldsData')) {
          const fieldId = column.split('.')[1];
          const field = await sendFormsMessage({
            subdomain,
            action: 'fields.findOne',
            data: {
              query: { _id: fieldId }
            },
            isRPC: true
          });

          headers.push(`customFieldsData.${field.text}.${fieldId}`);
        } else {
          headers.push(column);
        }
      }

      for (const item of results) {
        const result = {};

        for (const column of headers) {
          if (column.startsWith('customFieldsData')) {
            const fieldId = column.split('.')[2];
            const fieldName = column.split('.')[1];

            const { value } = await getCustomFieldsData(item, fieldId);

            result[column] = value || '-';
          } else if (column.startsWith('location')) {
            const location = item.location || {};

            result[column] = location[column.split('.')[1]];
          } else if (column.startsWith('visitorContactInfo')) {
            const visitorContactInfo = item.visitorContactInfo || {};

            result[column] = visitorContactInfo[column.split('.')[1]];
          } else if (column.startsWith('trackedData')) {
            const fieldName = column.split('.')[1];

            const { value } = await getTrackedData(item, fieldName);

            result[column] = value || '-';
          } else {
            const value = await fillValue(models, subdomain, column, item);

            result[column] = value || '-';
          }
        }

        docs.push(result);
      }
    } catch (e) {
      return { error: e.message };
    }
    return { docs };
  }
};
