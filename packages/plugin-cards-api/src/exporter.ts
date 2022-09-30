import { generateModels, IModels } from './connectionResolver';
import { EXPORT_TYPES, MODULE_NAMES } from './constants';
import {
  fetchSegment,
  sendFormsMessage,
  sendProductsMessage
} from './messageBroker';

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const { contentType, segment } = query;

  let data: any[] = [];

  const type = contentType.split(':')[1];

  const boardItemsFilter: any = {};

  if (segment) {
    const itemIds = await fetchSegment(subdomain, segment);

    boardItemsFilter._id = { $in: itemIds };
  }

  switch (type) {
    case MODULE_NAMES.DEAL:
      data = await models.Deals.find(boardItemsFilter).lean();

      break;
    case MODULE_NAMES.TASK:
      data = await models.Tasks.find(boardItemsFilter).lean();

      break;
    case MODULE_NAMES.TICKET:
      data = await models.Tickets.find(boardItemsFilter).lean();
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

const fillDealProductValue = async (subdomain, column, item) => {
  const productsData = item.productsData;
  let value;

  // if (productsData.length === 0) {
  //   return value;
  // }

  for (const productData of productsData) {
    let product;

    switch (column) {
      case 'productsData.amount':
        value = productData.amount;
        break;

      case 'productsData.name':
        product =
          (await sendProductsMessage({
            subdomain,
            action: 'findOne',
            data: {
              _id: productData.productId
            },
            isRPC: true
          })) || {};

        value = product.name;
        break;

      case 'productsData.code':
        product =
          (await sendProductsMessage({
            subdomain,
            action: 'findOne',
            data: {
              _id: productData.productId
            },
            isRPC: true
          })) || {};

        value = product.code;
        break;

      case 'productsData.discount':
        value = productData.discount;
        break;

      case 'productsData.discountPercent':
        value = productData.discountPercent;
        break;

      case 'productsData.currency':
        value = productData.amount;
        break;

      case 'productsData.tax':
        value = productData.tax;
        break;

      case 'productsData.taxPercent':
        value = productData.taxPercent;
        break;
    }
  }

  return { value };
};

export default {
  exportTypes: EXPORT_TYPES,

  prepareExportData: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { columnsConfig, contentType } = data;

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
        } else if (column.startsWith('productsData')) {
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

            result[fieldName] = value || '-';
          } else if (column.startsWith('productsData')) {
            const { value } = await fillDealProductValue(
              subdomain,
              column,
              item
            );

            result[column] = value || '-';
          } else {
            result[column] = item[column];
          }
        }

        headers.forEach((header, index) => {
          if (header.startsWith('customFieldsData')) {
            headers[index] = header.split('.')[1];
          }
        });

        console.log(headers);

        docs.push(result);
      }
    } catch (e) {
      return { error: e.message };
    }
    return { docs, headers };
  }
};
