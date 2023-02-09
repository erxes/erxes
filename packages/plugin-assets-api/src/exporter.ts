import { generateModels, IModels } from './connectionResolver';
import { sendFormsMessage } from './messageBroker';
import * as moment from 'moment';

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const { contentType, segmentId } = query;

  let data: any[] = [];

  const assetsFilter: any = {};

  data = await models.Assets.find(assetsFilter).lean();

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
  let value = item[column];

  switch (column) {
    case 'createdAt':
      value = moment(value).format('YYYY-MM-DD HH:mm');
      break;

    case 'categoryName':
      const category = await models.AssetCategories.findOne({
        _id: item.categoryId
      }).lean();

      value = category?.name || '-';

      break;
    case 'parentName':
      const parent = await models.Assets.findOne({
        _id: item.parentId
      }).lean();

      value = parent?.name || '-';

      break;

    default:
      break;
  }

  return value || '-';
};

export const IMPORT_EXPORT_TYPES = [
  {
    text: 'Assets',
    contentType: 'asset',
    icon: 'piggy-bank',
    skipFilter: true
  },
  {
    text: 'Assets Movement',
    contentType: 'assets-movement',
    icon: 'piggy-bank'
  }
];

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

            result[column] = value || '-';
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
