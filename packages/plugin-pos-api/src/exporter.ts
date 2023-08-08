import { generateModels, IModels } from './connectionResolver';
import {
  sendFormsMessage,
  sendCoreMessage,
  sendProductsMessage
} from './messageBroker';
import * as moment from 'moment';
import { IUserDocument } from '@erxes/api-utils/src/types';

const prepareData = async (
  models: IModels,
  _subdomain: string,
  query: any
): Promise<any[]> => {
  const { page, perPage } = query;

  const skip = (page - 1) * perPage;

  let data: any[] = [];

  const assetsFilter: any = {};

  data = await models.PosOrders.find(assetsFilter)
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

  const assetsFilter: any = {};

  data = await models.PosOrders.find(assetsFilter).count();

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

        return {
          value
        };
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
      value = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss');

      break;
    case 'branchId':
      const branchId = await models.PosOrders.findOne({
        branchId: item.branchId
      }).lean();
      value = branchId ? branchId.branchId : 'branchId not found';
      break;
    case 'departmentId':
      const departmentId = await models.PosOrders.findOne({
        departmentId: item.departmentId
      }).lean();
      value = departmentId
        ? departmentId.departmentId
        : 'departmentId not found';
      break;
    case 'customerId':
      const customerId = await models.PosOrders.findOne({
        customerId: item.customerId
      }).lean();
      value = customerId ? customerId.customerId : 'customerId not found';
      break;
    case 'registerNumber':
      const registerNumber = await models.PosOrders.findOne({
        registerNumber: item.registerNumber
      }).lean();
      value = registerNumber
        ? registerNumber.registerNumber
        : 'registerNumber not found';
      break;
    case 'totalAmount':
      const totalAmount = await models.PosOrders.findOne({
        totalAmount: item.totalAmount
      }).lean();
      value = totalAmount ? totalAmount.totalAmount : 'totalAmount not found';
      break;
    case 'number':
      const number = await models.PosOrders.findOne({
        number: item.number
      }).lean();
      value = number ? number.number : 'number not found';
      break;
    case 'userId':
      const createdUser: IUserDocument | null = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          _id: item.userId
        },
        isRPC: true
      });

      value = createdUser ? createdUser.username : 'user not found';

      break;
    case 'convertDealId':
      const convertDealId = await models.PosOrders.findOne({
        convertDealId: item.convertDealId
      }).lean();
      value = convertDealId
        ? convertDealId.convertDealId
        : 'convertDealId not found';
      break;
    case 'billId':
      const billId = await models.PosOrders.findOne({
        billId: item.billId
      }).lean();
      value = billId ? billId.billId : 'billId not found';
      break;
    default:
      break;
  }

  return value || '-';
};

const filposOrderValue = async (subdomain, column, item) => {
  const items = item.items;

  const productDocs: any[] = [];

  for (const itemData of items) {
    let product;
    let value;
    const result = {};
    switch (column) {
      case 'items.createdAt':
        value = moment(itemData.createdAt).format('YYYY-MM-DD HH:mm:ss');
        break;
      case 'items.discountPercent':
        value = itemData.discountPercent;
        break;
      case 'count':
        value = itemData.count;
        break;
      case 'items.productId':
        product =
          (await sendProductsMessage({
            subdomain,
            action: 'findOne',
            data: {
              _id: itemData.productId
            },
            isRPC: true
          })) || {};
        value = product.name;
      case 'items.unitPrice':
        value = itemData.unitPrice;
        break;
      case 'items.orderId':
        value = itemData.orderId;
        break;
      case 'items.bonusCount':
        value = itemData.bonusCount;
        break;
      case 'items.bonusVoucherId':
        value = itemData.bonusVoucherId;
        break;
      case 'items.discountAmount':
        value = itemData.discountAmount;
        break;
    }

    result[column] = value;

    productDocs.push(result);
  }

  return productDocs;
};
export const IMPORT_EXPORT_TYPES = [
  {
    text: 'Pos Orders',
    contentType: 'pos',
    icon: 'server-alt',
    skipFilter: true
  }
];

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
        } else if (column.startsWith('items')) {
          headers.push(column);
        } else {
          headers.push(column);
        }
      }

      for (const item of results) {
        const result = {};
        const productDocs = [] as any;
        const productsArray = [] as any;

        for (const column of headers) {
          if (column.startsWith('customFieldsData')) {
            const fieldId = column.split('.')[2];
            const fieldName = column.split('.')[1];

            const { value } = await getCustomFieldsData(item, fieldId);

            result[fieldName] = value || '-';
          } else if (column.startsWith('items')) {
            const productItem = await filposOrderValue(subdomain, column, item);

            productDocs.push(productItem);
          } else {
            const value = await fillValue(models, subdomain, column, item);

            result[column] = value || '-';
          }
        }

        if (productDocs.length > 0) {
          for (let i = 0; i < productDocs.length; i++) {
            const sortedItem = [] as any;

            for (const productDoc of productDocs) {
              sortedItem.push(productDoc[i]);
            }

            productsArray.push(sortedItem);
          }
        }

        if (productDocs.length > 0) {
          let index = 0;

          for (const productElement of productsArray) {
            const mergedObject = Object.assign({}, ...productElement);
            if (index === 0) {
              docs.push({
                ...result,
                ...mergedObject
              });
              index++;
            } else {
              docs.push(mergedObject);
            }
          }
        } else {
          docs.push(result);
        }
      }
    } catch (e) {
      return { error: e.message };
    }

    return { docs };
  }
};
