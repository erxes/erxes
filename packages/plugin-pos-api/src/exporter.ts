import { generateModels, IModels } from './connectionResolver';
import {
  sendCoreMessage,
  sendProductsMessage,
  fetchSegment,
  sendContactsMessage
} from './messageBroker';
import * as moment from 'moment';
import { IUserDocument } from '@erxes/api-utils/src/types';

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const { segmentData, page, perPage } = query;

  let data: any[] = [];

  const skip = (page - 1) * perPage;

  const filter: any = {};
  let itemIds = [];

  if (segmentData.conditions) {
    itemIds = await fetchSegment(subdomain, '', { page, perPage }, segmentData);

    filter._id = { $in: itemIds };
  }

  if (!(segmentData && Object.keys(segmentData))) {
    data = await models.PosOrders.find(filter)
      .skip(skip)
      .limit(perPage)
      .lean();
  }

  data = await models.PosOrders.find(filter).lean();

  return data;
};

const prepareDataCount = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any> => {
  const { segmentData } = query;

  let data = 0;

  const filter: any = {};

  if (segmentData.conditions) {
    const itemIds = await fetchSegment(
      subdomain,
      '',
      { scroll: true, page: 1, perPage: 10000 },
      segmentData
    );

    filter._id = { $in: itemIds };
  }

  data = await models.PosOrders.find(filter).count();

  return data;
};

export const fillValue = async (
  models: IModels,
  subdomain: string,
  column: string,
  order: any
): Promise<string> => {
  let value = order[column];

  switch (column) {
    case 'createdAt':
      value = moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss');
      break;
    case 'branchId':
      const branch = await sendCoreMessage({
        subdomain,
        action: 'branches.findOne',
        data: {
          _id: order.branchId || ''
        },
        isRPC: true,
        defaultValue: {}
      });
      value = branch ? `${branch.code || ''} - ${branch.title || ''}` : '';
      break;
    case 'departmentId':
      const department = await sendCoreMessage({
        subdomain,
        action: 'departments.findOne',
        data: { _id: order.departmentId || '' },
        isRPC: true,
        defaultValue: {}
      });
      value = department
        ? `${department.code || ''} - ${department.title}`
        : '';
      break;
    case 'customerId':
      if (order.customerId) {
        let info: any = {};
        if (order.customerType === 'company') {
          const company = await sendContactsMessage({
            subdomain,
            action: 'companies.findOne',
            data: { _id: order.customerId },
            isRPC: true,
            defaultValue: {}
          });

          info = company
            ? {
                _id: company._id,
                code: company.code,
                primaryPhone: company.primaryPhone,
                firstName: company.primaryName,
                primaryEmail: company.primaryEmail,
                lastName: ''
              }
            : {};
        } else if (order.customerType === 'user') {
          const user = await sendCoreMessage({
            subdomain,
            action: 'users.findOne',
            data: { _id: order.customerId },
            isRPC: true,
            defaultValue: {}
          });
          info = user
            ? {
                _id: user._id,
                code: user.code,
                primaryPhone:
                  (user.details && user.details.operatorPhone) || '',
                firstName: `${user.firstName || ''} ${user.lastName || ''}`,
                primaryEmail: user.email,
                lastName: user.username
              }
            : {};
        } else {
          const customer = await sendContactsMessage({
            subdomain,
            action: 'customers.findOne',
            data: { _id: order.customerId },
            isRPC: true,
            defaultValue: {}
          });

          info = customer
            ? {
                _id: customer._id,
                code: customer.code,
                primaryPhone: customer.primaryPhone,
                firstName: customer.firstName,
                primaryEmail: customer.primaryEmail,
                lastName: customer.lastName
              }
            : {};
        }

        value =
          info.code ||
          info.firstName ||
          info.lastName ||
          info.primaryPhone ||
          info.primaryEmail ||
          info._id;
      } else {
        value = '';
      }
      value = order.customerId ? order.customerId : 'customerId not found';
      break;
    case 'registerNumber':
      value = order.registerNumber
        ? order.registerNumber
        : 'registerNumber not found';
      break;
    case 'totalAmount':
      value = order.totalAmount ? order.totalAmount : 'totalAmount not found';
      break;
    case 'number':
      value = order.number ? order.number : 'number not found';
      break;
    case 'userId':
      const createdUser: IUserDocument | null = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: {
          _id: order.userId
        },
        isRPC: true
      });

      value = createdUser ? createdUser.username : 'user not found';

      break;
    case 'convertDealId':
      value = order.convertDealId ? order.convertDealId : '';
      break;
    case 'billId':
      value = order.billId || '';
      break;
    case 'paymentType':
      value = [
        ...Array.from(
          new Set(
            [
              ...order.paidAmounts,
              { type: 'cash', amount: order.cashAmount },
              { type: 'mobile', amount: order.mobileAmount }
            ]
              .filter(pa => pa.amount > 0)
              .map(pa => pa.type)
          )
        )
      ].join(', ');
      break;
    case 'pos':
      const pos = await models.Pos.findOne({ token: order.posToken });
      value = pos ? pos.name : '';
      break;
    default:
      value = order[column] || '';
      break;
  }

  return value || '';
};

const fillPosOrderItemValue = async (subdomain, column, order) => {
  const items = order.items || [];

  const itemsDocs: any[] = [];
  const productsById = {};
  const productCategoriesById = {};

  if (column.includes('items.product')) {
    const productIds = items.map(i => i.productId);

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: { _id: { $in: productIds } },
        limit: productIds.length
      },
      isRPC: true,
      defaultValue: []
    });

    for (const prod of products) {
      productsById[prod._id] = prod;
    }

    if (column.includes('items.productCategory')) {
      const categoryIds = products.map(p => p.categoryId);
      const categories = await sendProductsMessage({
        subdomain,
        action: 'categories.find',
        data: {
          query: { _id: { $in: categoryIds } }
        },
        isRPC: true,
        defaultValue: []
      });

      for (const cat of categories) {
        productCategoriesById[cat._id] = cat;
      }
    }
  }

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
        product = productsById[itemData.productId || ''] || {};
        value = `${product.code} - ${product.name}`;
        break;
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
      case 'items.amount':
        value = itemData.unitPrice * itemData.count;
        break;
      case 'items.productCategoryCode':
        const categoryC =
          productCategoriesById[
            (productsById[itemData.productId] || {}).categoryId || ''
          ];
        value = (categoryC && categoryC.code) || '';
        break;
      case 'items.productCategoryName':
        const categoryN =
          productCategoriesById[
            (productsById[itemData.productId] || {}).categoryId || ''
          ];
        value = (categoryN && categoryN.name) || '';
        break;
      case 'items.productCode':
        product = productsById[itemData.productId || ''] || {};
        value = product.code;
        break;
      case 'items.productName':
        product = productsById[itemData.productId || ''] || {};
        value = product.name;
        break;
      case 'items.barcode':
        product = productsById[itemData.productId || ''] || {};
        value =
          (product.barcodes && product.barcodes.length & product.barcodes[0]) ||
          '';
        break;
      default:
        value = itemData[column.replace('items.', '')] || '';
        break;
    }

    result[column] = value;

    itemsDocs.push(result);
  }

  return itemsDocs;
};

export const IMPORT_EXPORT_TYPES = [
  {
    text: 'Pos Orders',
    contentType: 'pos',
    icon: 'server-alt'
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
        if (column.startsWith('items')) {
          headers.push(column);
        } else {
          headers.push(column);
        }
      }

      for (const header of headers) {
        excelHeader.push(header);
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
        if (column.startsWith('items')) {
          headers.push(column);
        } else {
          headers.push(column);
        }
      }

      for (const order of results) {
        const result = {};
        const orderItemsDocs: any = {};
        let itemsLen = 0;

        for (const column of headers) {
          if (column.startsWith('items')) {
            const orderItem = await fillPosOrderItemValue(
              subdomain,
              column,
              order
            );

            itemsLen = orderItem.length;
            orderItemsDocs[column] = orderItem;
          } else {
            const value = await fillValue(models, subdomain, column, order);
            result[column] = value || '-';
          }
        }

        if (Object.keys(orderItemsDocs || {}).length > 0 && itemsLen) {
          for (let i = 0; i < itemsLen; i++) {
            const itemDocs = {};
            for (const itemCol of Object.keys(orderItemsDocs)) {
              itemDocs[itemCol] = ((orderItemsDocs[itemCol] || [])[i] || {})[
                itemCol
              ];
            }
            docs.push({ ...itemDocs, ...result });
          }
        } else {
          docs.push(result);
        }
      }
    } catch (e) {
      console.log(`export error: ${e.message}`);
      return { error: e.message };
    }

    return { docs };
  }
};
