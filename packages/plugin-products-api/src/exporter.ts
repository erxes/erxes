import { generateModels, IModels } from './connectionResolver';
import { sendFormsMessage, sendTagsMessage } from './messageBroker';
import * as moment from 'moment';

const prepareData = async (
  models: IModels,
  _subdomain: string,
  _query: any
): Promise<any[]> => {
  let data: any[] = [];

  const { page, perPage } = _query;
  const skip = (page - 1) * perPage;

  const productsFilter: any = {};

  data = await models.Products.find(productsFilter)
    .skip(skip)
    .limit(perPage)
    .lean();

  return data;
};

const prepareDataCount = async (
  models: IModels,
  _subdomain: string,
  _query: any
): Promise<any> => {
  let data = 0;

  const productsFilter: any = {};

  data = await models.Products.find(productsFilter).count();

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
      value = moment(value).format('YYYY-MM-DD');
      break;

    case 'categoryName':
      const category = await models.ProductCategories.findOne({
        _id: item.categoryId
      }).lean();

      value = category?.name || '-';

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

    case 'barcodes':
      value =
        item.barcodes && item.barcodes.length ? item.barcodes.join(',') : '';
      break;

    case 'uom':
      const uom = await models.Uoms.findOne({
        _id: item.uom
      }).lean();

      value = uom?.name || '-';
      break;

    default:
      break;
  }

  return value || '-';
};

export const IMPORT_EXPORT_TYPES = [
  {
    text: 'Product & Services',
    contentType: 'product',
    icon: 'server-alt',
    skipFilter: true
  }
];

const fillProductSubUomValue = async (models: IModels, column, item) => {
  const subUoms = item.subUoms;
  let value;

  for (const subUom of subUoms) {
    let uom;

    switch (column) {
      case 'subUoms.code':
        uom = (await models.Uoms.findOne({ _id: subUom.uom })) || {};
        value = uom.code;
        break;
      case 'subUoms.name':
        uom = (await models.Uoms.findOne({ _id: subUom.uom })) || {};
        value = uom.name;
        break;
      case 'subUoms.subratio':
        value = subUom.ratio;
        break;
    }
  }

  return { value };
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
              query: { _id: fieldId }
            },
            isRPC: true
          });

          headers.push(`customFieldsData.${field.text}.${fieldId}`);
        } else if (column.startsWith('subUoms')) {
          headers.push(column);
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
        } else if (column.startsWith('subUoms')) {
          headers.push(column);
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
          } else if (column.startsWith('subUoms')) {
            const { value } = await fillProductSubUomValue(
              models,
              column,
              item
            );

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
