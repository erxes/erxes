const IMPORT_EXPORT_TYPES = [
  {
    text: 'Team member',
    contentType: 'user',
    icon: 'user-square'
  }
];

import * as moment from 'moment';
import { generateModels, IModels } from './connectionResolver';
import { IUserDocument } from './db/models/definitions/users';
import { fetchSegment, sendFormsMessage } from './messageBroker';

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const { segmentData } = query;

  const boardItemsFilter: any = {};
  let itemIds = [];

  if (segmentData.conditions) {
    itemIds = await fetchSegment(
      subdomain,
      '',
      { scroll: true, page: 1, perPage: 10000 },
      segmentData
    );

    boardItemsFilter._id = { $in: itemIds };
  }

  return models.Users.find(boardItemsFilter).lean();
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
  _subdomain: string,
  column: string,
  item: IUserDocument
): Promise<string> => {
  let value = item[column];

  switch (column) {
    case 'createdAt':
      value = moment(value).format('YYYY-MM-DD');
      break;

    case 'branches':
      const branches = await models.Branches.find({
        _id: item.branchIds
      }).lean();

      value = branches.map(branch => branch.title).join(', ');

      break;

    case 'departments':
      const departments = await models.Branches.find({
        _id: item.branchIds
      }).lean();

      value = departments.map(department => department.title).join(', ');

      break;

    case 'password':
      value = '';

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

    const docs = [] as any;
    const headers = [] as any;
    const excelHeader = [] as any;

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

            result[fieldName] = value || '-';
          } else {
            const value = await fillValue(models, subdomain, column, item);

            result[column] = value || '-';
          }
        }

        docs.push(result);
      }

      for (const header of headers) {
        if (header.startsWith('customFieldsData')) {
          excelHeader.push(header.split('.')[1]);
        } else {
          excelHeader.push(header);
        }
      }
    } catch (e) {
      return { error: e.message };
    }
    return { docs, excelHeader };
  }
};
