import { IOrder, IOrderDocument } from '../../models/definitions/orders';
import { IModels } from '../../connectionResolver';
import { IPayment } from '../resolvers/mutations/orders';
import { IOrderInput, IOrderItemInput } from '../types';
import { IOrderItemDocument } from '../../models/definitions/orderItems';
import { sendRequest } from '@erxes/api-utils/src/requests';
import {
  DISTRICTS,
  ORDER_STATUSES,
  BILL_TYPES
} from '../../models/definitions/constants';
import {
  IConfigDocument,
  IConfig,
  IEbarimtConfig
} from '../../models/definitions/configs';
import * as moment from 'moment';
import { graphqlPubsub } from '../../configs';
import messageBroker from '../../messageBroker';
import { debugError } from '@erxes/api-utils/src/debuggers';

interface IDetailItem {
  count: number;
  amount: number;
  inventoryCode: string;
  productId: string;
}

export const getPureDate = (date?: Date) => {
  const ndate = date ? new Date(date) : new Date();
  const diffTimeZone = ndate.getTimezoneOffset() * 1000 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const generateOrderNumber = async (
  models: IModels,
  config?: IConfig
): Promise<string> => {
  const todayStr = moment()
    .format('YYYYMMDD')
    .toString();

  const beginNumber =
    (config && config.beginNumber && `${config.beginNumber}.`) || '';

  let suffix = '0001';
  let number = `${todayStr}_${beginNumber}${suffix}`;

  const latestOrder = ((await models.Orders.find({
    number: { $regex: new RegExp(`^${todayStr}_${beginNumber}*`) },
    posToken: { $in: ['', null] }
  })
    .sort({ number: -1 })
    .limit(1)
    .lean()) || [])[0];

  if (latestOrder && latestOrder._id) {
    const parts = latestOrder.number.split('_');

    const suffixParts = parts[1].split('.');
    const latestSuffix =
      (suffixParts.length === 2 && suffixParts[1]) || suffixParts[0];

    const latestNum = parseInt(latestSuffix, 10);
    const addend =
      (config &&
        config.maxSkipNumber &&
        config.maxSkipNumber > 1 &&
        Math.round(Math.random() * (config.maxSkipNumber - 1) + 1)) ||
      1;

    suffix = String(latestNum + addend).padStart(4, '0');
    number = `${todayStr}_${beginNumber}${suffix}`;
  }

  return number;
};

export const validateOrder = async (models: IModels, doc: IOrderInput) => {
  const { items = [] } = doc;

  if (items.filter(i => !i.isPackage).length < 1) {
    throw new Error('Products missing in order. Please add products');
  }

  for (const item of items) {
    // will throw error if product is not found
    await models.Products.getProduct({ _id: item.productId });
  }
};

export const validateOrderPayment = (order: IOrder, doc: IPayment) => {
  if (order.paidDate) {
    throw new Error('Order has already been paid');
  }
  const {
    cardAmount: paidCard = 0,
    cashAmount: paidCash = 0,
    mobileAmount: paidMobile = 0
  } = order;
  const { cashAmount = 0 } = doc;

  const paidTotal = Number((paidCard + paidCash + paidMobile).toFixed(2));
  // only remainder cash amount will come
  const total = Number(cashAmount.toFixed(2));

  if (total + paidTotal !== order.totalAmount) {
    throw new Error(`Paid amount does not match order's total amount`);
  }
};

export const cleanOrderItems = async (
  orderId: string,
  items: IOrderItemInput[],
  models: IModels
) => {
  const itemIds = items.map(item => item._id);

  await models.OrderItems.deleteMany({ orderId, isPackage: true });
  await models.OrderItems.deleteMany({ orderId, _id: { $nin: itemIds } });
};

export const updateOrderItems = async (
  orderId: string,
  items: IOrderItemInput[],
  models
) => {
  const oldItems = await models.OrderItems.find({
    _id: { $in: items.map(item => item._id) }
  }).lean();

  const itemIds = oldItems.map(i => i._id);

  for (const item of items) {
    const doc = {
      productId: item.productId,
      count: item.count,
      unitPrice: item.unitPrice,
      isPackage: item.isPackage,
      isTake: item.isTake
    };

    if (itemIds.includes(item._id)) {
      await models.OrderItems.updateOrderItem(item._id, doc);
    } else {
      await models.OrderItems.createOrderItem({
        ...doc,
        orderId
      });
    }
  }
};

export const getTotalAmount = (items: IOrderItemInput[] = []): number => {
  let total = 0;

  for (const item of items) {
    total += (item.count || 0) * (item.unitPrice || 0);
  }

  return Number(total.toFixed(2));
};

export const getDistrictName = (districtCode: string): string => {
  if (DISTRICTS[districtCode]) {
    return DISTRICTS[districtCode];
  }

  return '';
};

export const prepareEbarimtData = async (
  models: IModels,
  order: IOrderDocument,
  config: IEbarimtConfig,
  items: IOrderItemDocument[] = [],
  orderBillType: string,
  registerNumber?: string
) => {
  if (!config) {
    throw new Error('has not ebarimt config');
  }
  if (!order) {
    throw new Error('Order must be specified');
  }

  let billType = orderBillType || order.billType || BILL_TYPES.CITIZEN;
  let customerCode = '';
  let customerName = '';

  if (registerNumber) {
    const response = await sendRequest({
      url: config.checkCompanyUrl,
      method: 'GET',
      params: { regno: registerNumber }
    });

    if (response.found) {
      billType = BILL_TYPES.ENTITY;
      customerCode = registerNumber;
      customerName = response.name;
    }
  }

  const productIds = items.map(item => item.productId);
  const products = await models.Products.find({ _id: { $in: productIds } });
  const productsById = {};

  for (const product of products) {
    productsById[product._id] = product;
  }

  const details: IDetailItem[] = [];

  for (const item of items) {
    // if wrong productId then not sent
    if (!productsById[item.productId]) {
      continue;
    }

    const amount = (item.count || 0) * (item.unitPrice || 0);

    details.push({
      count: item.count,
      amount,
      inventoryCode: productsById[item.productId].code,
      productId: item.productId
    });
  }

  const cashAmount = order.totalAmount || 0;

  const orderInfo = {
    date: new Date().toISOString().slice(0, 10),
    orderId: order._id,
    hasVat: config.hasVat || false,
    hasCitytax: config.hasCitytax || false,
    billType,
    customerCode,
    customerName,
    description: order.number,
    details,
    cashAmount,
    nonCashAmount: 0,
    ebarimtResponse: {}
  };

  return {
    ...orderInfo,
    productsById,
    contentType: 'pos',
    contentId: order._id
  };
};

export const prepareOrderDoc = async (
  doc: IOrderInput,
  config: IConfigDocument,
  models: IModels
) => {
  const { catProdMappings = [] } = config;

  const items = doc.items.filter(i => !i.isPackage) || [];

  const hasTakeItems = items.filter(i => i.isTake);

  if (hasTakeItems.length > 0 && catProdMappings.length > 0) {
    const packOfCategoryId = {};

    for (const rel of catProdMappings) {
      packOfCategoryId[rel.categoryId] = rel.productId;
    }

    const products = await models.Products.find({
      _id: { $in: items.map(i => i.productId) }
    }).lean();

    const productsOfId = {};

    for (const prod of products) {
      productsOfId[prod._id] = prod;
    }

    const toAddProducts = {};

    for (const item of hasTakeItems) {
      const product = productsOfId[item.productId];

      if (Object.keys(packOfCategoryId).includes(product.categoryId)) {
        const packProductId = packOfCategoryId[product.categoryId];

        if (!Object.keys(toAddProducts).includes(packProductId)) {
          toAddProducts[packProductId] = { count: 0 };
        }

        toAddProducts[packProductId].count += item.count;
      }
    } // end items loop

    const addProductIds = Object.keys(toAddProducts);

    if (addProductIds.length) {
      const takingProducts = await models.Products.find({
        _id: { $in: addProductIds }
      });

      for (const addProduct of takingProducts) {
        const toAddItem = toAddProducts[addProduct._id];

        const fixedUnitPrice = Number((addProduct.unitPrice || 0).toFixed(2));

        items.push({
          _id: Math.random().toString(),
          productId: addProduct._id,
          count: toAddItem.count,
          unitPrice: fixedUnitPrice,
          isPackage: true,
          isTake: true
        });

        doc.totalAmount += (toAddItem.count || 0) * fixedUnitPrice;
      }
    }
  }

  return { ...doc, items };
};

export const checkOrderStatus = (order: IOrderDocument) => {
  if (order.status === ORDER_STATUSES.PAID || order.paidDate) {
    throw new Error('Order is already paid');
  }
};

export const checkOrderAmount = (order: IOrderDocument, amount: number) => {
  const { cardAmount = 0, cashAmount = 0, mobileAmount = 0 } = order;

  const paidAmount = cardAmount + cashAmount + mobileAmount;

  if (paidAmount + amount > order.totalAmount) {
    throw new Error('Amount exceeds total amount');
  }
};

export const checkUnpaidInvoices = async (orderId: string, models: IModels) => {
  const invoices = await models.QPayInvoices.countDocuments({
    senderInvoiceNo: orderId,
    status: { $ne: 'PAID' }
  });

  if (invoices > 0) {
    throw new Error('There are unpaid QPay invoices for this order');
  }
};

// qpay нэхэмжлэх үүсгэхийн өмнө дуудна
export const checkInvoiceAmount = async ({
  order,
  amount,
  models
}: {
  order: IOrderDocument;
  amount: number;
  models: IModels;
}) => {
  const invoices = await models.QPayInvoices.find({
    senderInvoiceNo: order._id
  }).lean();

  let total = 0;

  for (const inv of invoices) {
    total += Number(inv.amount || 0);
  }

  if (total + amount > order.totalAmount) {
    throw new Error('Invoice amount exceeds order amount');
  }

  const paidAmount = models.Orders.getPaidAmount(order);

  // үүсгэх гэж буй нэхэмжлэхийн дүн төлөх үлдэгдлээс ихгүй байх ёстой
  if (paidAmount + amount > order.totalAmount) {
    throw new Error('Invoice amount exceeds remainder amount');
  }
};

export const commonCheckPayment = async (
  models,
  orderId,
  config,
  paidAmount
) => {
  let order = await models.Orders.getOrder(orderId);

  await models.Orders.updateOne(
    { _id: orderId },
    {
      $set: { mobileAmount: paidAmount }
    }
  );

  order = await models.Orders.getOrder(orderId);

  const doc = {
    billType: order.billType || BILL_TYPES.CITIZEN,
    registerNumber: order.registerNumber || '',
    cashAmount: order.cashAmount || 0,
    mobileAmount: order.mobileAmount,
    cardAmount: order.cardAmount || 0
  };

  checkOrderStatus(order);

  await checkUnpaidInvoices(orderId, models);

  const items = await models.OrderItems.find({
    orderId: order._id
  }).lean();

  await validateOrderPayment(order, doc);

  const data = await prepareEbarimtData(
    models,
    order,
    config.ebarimtConfig,
    items,
    doc.billType,
    doc.registerNumber || order.registerNumber
  );

  const ebarimtConfig = {
    ...config.ebarimtConfig,
    districtName: getDistrictName(config.ebarimtConfig.districtCode)
  };

  try {
    const response = await models.PutResponses.putData({
      ...data,
      config: ebarimtConfig,
      models
    });

    if (response && response.success === 'true') {
      const now = new Date();

      await models.Orders.updateOne(
        { _id: orderId },
        {
          $set: {
            ...doc,
            paidDate: now,
            status: ORDER_STATUSES.PAID,
            modifiedAt: now
          }
        }
      );
    }

    order = await models.Orders.getOrder(orderId);
    graphqlPubsub.publish('ordersOrdered', {
      ordersOrdered: {
        _id: orderId,
        status: order.status,
        customerId: order.customerId
      }
    });

    try {
      messageBroker().sendMessage('vrpc_queue:erxes-pos-to-api', {
        action: 'makePayment',
        posToken: config.token,
        syncId: config.syncInfo.id,
        response,
        order,
        items
      });
    } catch (e) {
      debugError(`Error occurred while sending data to erxes: ${e.message}`);
    }

    return response;
  } catch (e) {
    debugError(e);

    return e;
  }
};
