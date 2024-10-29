import * as moment from 'moment';
import { generateModels, IModels } from './connectionResolver';
import { IUserDocument } from './db/models/definitions/users';
import { InterMessage } from '@erxes/api-utils/src/messageBroker';
import { fetchSegment } from './data/modules/segments/queryBuilder';
import { ICustomerDocument } from './db/models/definitions/customers';
import { ICompanyDocument } from './db/models/definitions/companies';
import { sendInboxMessage } from './messageBroker';
import cocExport from './data/modules/coc/exporter';
import productExport from './data/modules/product/exporter';

const IMPORT_EXPORT_TYPES = [
  {
    text: 'Team member',
    contentType: 'user',
    icon: 'user-square',
  },
  {
    text: 'Customers',
    contentType: 'customer',
    icon: 'users-alt',
  },
  {
    text: 'Leads',
    contentType: 'lead',
    icon: 'file-alt',
  },
  {
    text: 'Companies',
    contentType: 'company',
    icon: 'building',
  },
  {
    text: 'Product & Services',
    contentType: 'product',
    icon: 'server-alt',
  },
];

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const { contentType, segmentData, page, perPage } = query;

  const type = contentType.split(':')[1];

  const itemsFilter: any = {};
  let itemIds = [];
  const skip = (page - 1) * perPage;

  let data: any[] = [];

  if (segmentData.conditions) {
    itemIds = await fetchSegment(models, subdomain, segmentData, {
      page,
      perPage,
    });

    itemsFilter._id = { $in: itemIds };
  }

  if (!segmentData) {
    data = await models.Users.find(itemsFilter)
      .skip(skip)
      .limit(perPage)
      .lean();
  }

  switch (type) {
    default:
      if (!segmentData) {
        data = await models.Users.find(itemsFilter)
          .skip(skip)
          .limit(perPage)
          .lean();
      }

      data = await models.Users.find(itemsFilter).lean();

      break;
  }

  return data;
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

const prepareDataCount = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any> => {
  const { segmentData, contentType } = query;

  const type = contentType.split(':')[1];

  let data = 0;

  const contactsFilter: any = {};

  if (segmentData.conditions) {
    const itemIds = await fetchSegment(models, subdomain, segmentData, {
      scroll: true,
      page: 1,
      perPage: 10000,
    });

    contactsFilter._id = { $in: itemIds };
  }

  switch (type) {
    default:
      data = await models.Users.find(contactsFilter).countDocuments();
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

export const fillValue = async (
  models: IModels,
  subdomain: string,
  column: string,
  item: any
): Promise<string> => {
  const [splitedColumn, detail] = column.split('.');

  let value = item[column];

  if (detail) {
    value = item[splitedColumn][detail];
  }

  switch (column) {
    case 'createdAt':
      value = moment(value).format('YYYY-MM-DD');
      break;

    case 'branches':
      const branches = await models.Branches.find({
        _id: item.branchIds,
      }).lean();

      value = branches.map((branch) => branch.title).join(', ');

      break;

    case 'departments':
      const departments = await models.Departments.find({
        _id: item.departmentIds,
      }).lean();

      value = departments.map((department) => department.title).join(', ');

      break;

    case 'password':
      value = '';

      break;

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
          _id: { $in: item.mergedIds || [] },
        }
      );

      value = customers
        .map((cus) => cus.firstName || cus.primaryEmail)
        .join(', ');

      break;
    // company fields
    case 'names':
      value = (item.names || []).join(', ');

      break;
    case 'parentCompanyId':
      const parent: ICompanyDocument | null = await models.Companies.findOne({
        _id: item.parentCompanyId,
      });

      value = parent ? parent.primaryName : '';

      break;

    case 'tag':
      const tags = await models.Tags.find({ $in: item.tagIds || [] });

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
        defaultValue: [],
      });

      value = integration ? integration.name : '-';

      break;

    case 'ownerEmail':
      const owner: IUserDocument | null = await models.Users.findOne({
        _id: item.ownerId,
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

  prepareExportData: async ({ subdomain, data }: InterMessage) => {
    const models = await generateModels(subdomain);
    const { contentType } = data;

    const { columnsConfig } = data;

    let totalCount = 0;
    const headers = [] as any;
    const excelHeader = [] as any;
    const keys = ['customer', 'lead', 'company'];

    try {
      if (keys.some((keyword) => contentType.includes(keyword))) {
        return await cocExport.prepareExportData({ subdomain, data });
      }
      if (contentType.includes('product')) {
        return await productExport.prepareExportData({ subdomain, data });
      }

      const results = await prepareDataCount(models, subdomain, data);

      totalCount = results;

      for (const column of columnsConfig) {
        if (column.startsWith('customFieldsData')) {
          const fieldId = column.split('.')[1];

          const field = await models.Fields.findOne({ _id: fieldId });

          if (field) {
            headers.push(`customFieldsData.${field.text}.${fieldId}`);
          }
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
        error: e.message,
      };
    }
    return { totalCount, excelHeader };
  },

  getExportDocs: async ({ subdomain, data }: InterMessage) => {
    const models = await generateModels(subdomain);

    const { columnsConfig, contentType } = data;

    const docs = [] as any;
    const headers = [] as any;
    const keys = ['customer', 'lead', 'company'];

    try {
      if (keys.some((keyword) => contentType.includes(keyword))) {
        return await cocExport.getExportDocs({ subdomain, data });
      }
      if (contentType.includes('product')) {
        return await productExport.getExportDocs({ subdomain, data });
      }

      const results = await prepareData(models, subdomain, data);

      for (const column of columnsConfig) {
        if (column.startsWith('customFieldsData')) {
          const fieldId = column.split('.')[1];
          const field = await models.Fields.findOne({ _id: fieldId });

          if (field) {
            headers.push(`customFieldsData.${field.text}.${fieldId}`);
          }
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
  },
};
