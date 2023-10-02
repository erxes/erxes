import { IOrder, IOrderDocument } from '../../models/definitions/orders';
import { IModels } from '../../connectionResolver';
import { IPayment } from '../resolvers/mutations/orders';
import { IOrderInput, IOrderItemInput } from '../types';
import { IOrderItemDocument } from '../../models/definitions/orderItems';
import { sendRequest } from '@erxes/api-utils/src/requests';
import {
  DISTRICTS,
  BILL_TYPES,
  ORDER_TYPES,
  ORDER_ITEM_STATUSES
} from '../../models/definitions/constants';
import {
  IConfigDocument,
  IConfig,
  IEbarimtConfig
} from '../../models/definitions/configs';
import * as moment from 'moment';
import { debugError } from '@erxes/api-utils/src/debuggers';
import { isValidBarcode } from './otherUtils';
import { IProductDocument } from '../../models/definitions/products';
import { checkLoyalties } from './loyalties';
import { checkPricing } from './pricing';
import { checkRemainders } from './products';

interface IDetailItem {
  count: number;
  amount: number;
  inventoryCode: string;
  barcode: string;
  productId: string;
}

export const generateOrderNumber = async (
  models: IModels,
  config: IConfig
): Promise<string> => {
  const todayStr = moment()
    .format('YYYYMMDD')
    .toString();

  const beginNumber =
    (config && config.beginNumber && `${config.beginNumber}.`) || '';

  let suffix = '0001';
  let number = `${todayStr}_${beginNumber}${suffix}`;

  let latestOrder;

  const latestOrders = await models.Orders.aggregate([
    {
      $match: {
        posToken: config.token,
        number: { $regex: new RegExp(`^${todayStr}_${beginNumber}*`) }
      }
    },
    {
      $project: {
        number: 1,
        number_len: { $strLenCP: '$number' }
      }
    },
    { $sort: { number_len: -1, number: -1 } },
    { $limit: 1 }
  ]);

  if (latestOrders.length) {
    latestOrder = latestOrders[0];
  }

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

export const validateOrder = async (
  subdomain: string,
  models: IModels,
  config: IConfigDocument,
  doc: IOrderInput
) => {
  const { items = [] } = doc;

  if (items.filter(i => !i.isPackage).length < 1) {
    throw new Error('Products missing in order. Please add products');
  }

  const products = await models.Products.find({
    _id: { $in: items.map(i => i.productId) }
  }).lean();
  const productIds = products.map(p => p._id);

  for (const item of items) {
    // will throw error if product is not found
    if (!productIds.includes(item.productId)) {
      throw new Error('Products missing in order');
    }
  }

  if (
    config.isCheckRemainder &&
    (doc.branchId || config.branchId) &&
    doc.type !== 'before'
  ) {
    const checkProducts = products.filter(
      p => (p.isCheckRems || {})[config.token] || false
    );

    if (checkProducts.length) {
      const result = await checkRemainders(
        subdomain,
        config,
        checkProducts,
        doc.branchId || config.branchId
      );

      const errors: string[] = [];
      const withRemProductById = {};
      for (const product of result) {
        withRemProductById[product._id] = product;
      }

      for (const item of items) {
        const product = withRemProductById[item.productId];
        if (!product) {
          continue;
        }

        if (product.remainder < item.count) {
          errors.push(
            `#${product.code} - ${product.name} have a potential sales balance of ${product.remainder}`
          );
        }
      }

      if (errors.length) {
        throw new Error(errors.join(', '));
      }
    }
  }
};

export const validateOrderPayment = (order: IOrder, doc: IPayment) => {
  if (order.paidDate) {
    throw new Error('Order has already been paid');
  }
  const {
    cashAmount: paidCash = 0,
    mobileAmount: paidMobile = 0,
    paidAmounts
  } = order;
  const { cashAmount = 0 } = doc;

  const paidTotal = Number(
    (
      paidCash +
      paidMobile +
      (paidAmounts || []).reduce((sum, i) => Number(sum) + Number(i.amount), 0)
    ).toFixed(2)
  );
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
  models: IModels
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
      discountPercent: item.discountPercent,
      discountAmount: item.discountAmount,
      bonusCount: item.bonusCount,
      bonusVoucherId: item.bonusVoucherId,
      isPackage: item.isPackage,
      isTake: item.isTake,
      manufacturedDate: item.manufacturedDate,
      description: item.description,
      attachment: item.attachment
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
  registerNumber?: string,
  paymentTypes?: any[]
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

  let itemAmountPrePercent = 0;
  const preTaxPaymentTypes = (paymentTypes || []).filter(p =>
    (p.config || '').includes('preTax: true')
  );
  if (
    preTaxPaymentTypes.length &&
    order.paidAmounts &&
    order.paidAmounts.length
  ) {
    let preSentAmount = 0;
    for (const preTaxPaymentType of preTaxPaymentTypes) {
      const matchOrderPays = order.paidAmounts.filter(
        pa => pa.type === preTaxPaymentType.type
      );
      if (matchOrderPays.length) {
        for (const matchOrderPay of matchOrderPays) {
          preSentAmount += matchOrderPay.amount;
        }
      }
    }

    if (preSentAmount && preSentAmount <= order.totalAmount) {
      itemAmountPrePercent = (preSentAmount / order.totalAmount) * 100;
    }
  }

  const productIds = items.map(item => item.productId);
  const products = await models.Products.find({ _id: { $in: productIds } });
  const productsById = {};

  for (const product of products) {
    productsById[product._id] = product;
  }

  const details: IDetailItem[] = [];
  const detailsFree: IDetailItem[] = [];
  const details0: IDetailItem[] = [];
  const detailsInner: (IDetailItem & { itemId: string })[] = [];
  let amountDefault = 0;
  let amountFree = 0;
  let amount0 = 0;
  let amountInner = 0;

  for (const item of items) {
    const product = productsById[item.productId];

    // if wrong productId then not sent
    if (!product) {
      continue;
    }

    const tempAmount = (item.count || 0) * (item.unitPrice || 0);
    const amount = tempAmount - (tempAmount / 100) * itemAmountPrePercent;

    const stock = {
      count: item.count,
      amount,
      discount: item.discountAmount,
      inventoryCode: product.code,
      productId: item.productId
    };

    if (product.taxType === '2') {
      detailsFree.push({ ...stock, barcode: product.taxCode });
      amountFree += amount;
    } else if (product.taxType === '3' && billType === '3') {
      details0.push({ ...stock, barcode: product.taxCode });
      amount0 += amount;
    } else if (product.taxType === '5') {
      detailsInner.push({
        ...stock,
        barcode: product.taxCode,
        itemId: item._id
      });
      amountInner += amount;
    } else {
      let trueBarcode = '';
      for (const barcode of product.barcodes) {
        if (isValidBarcode(barcode)) {
          trueBarcode = barcode;
          continue;
        }
      }
      details.push({ ...stock, barcode: trueBarcode });
      amountDefault += amount;
    }
  }

  const commonOderInfo = {
    date: new Date().toISOString().slice(0, 10),
    orderId: order._id,
    number: order.number,
    hasVat: config.hasVat || false,
    hasCitytax: config.hasCitytax || false,
    billType,
    customerCode,
    customerName,
    description: order.number,
    ebarimtResponse: {},
    productsById,
    contentType: 'pos',
    contentId: order._id
  };

  const result: any[] = [];
  let calcCashAmount = order.cashAmount || 0;
  let cashAmount = 0;

  if (detailsFree && detailsFree.length) {
    if (calcCashAmount > amountFree) {
      cashAmount = amountFree;
      calcCashAmount -= amountFree;
    } else {
      cashAmount = calcCashAmount;
      calcCashAmount = 0;
    }
    result.push({
      ...commonOderInfo,
      hasVat: false,
      taxType: '2',
      details: detailsFree,
      cashAmount,
      nonCashAmount: amountFree - cashAmount
    });
  }

  if (details0 && details0.length) {
    if (calcCashAmount > amount0) {
      cashAmount = amount0;
      calcCashAmount -= amount0;
    } else {
      cashAmount = calcCashAmount;
      calcCashAmount = 0;
    }
    result.push({
      ...commonOderInfo,
      hasVat: false,
      taxType: '3',
      details: details0,
      cashAmount,
      nonCashAmount: amount0 - cashAmount
    });
  }

  if (detailsInner && detailsInner.length) {
    if (calcCashAmount > amountInner) {
      cashAmount = amountInner;
      calcCashAmount -= amountInner;
    } else {
      cashAmount = calcCashAmount;
      calcCashAmount = 0;
    }
    result.push({
      ...commonOderInfo,
      hasVat: false,
      hasCityTax: false,
      itemIds: detailsInner.map(di => di.itemId),
      inner: true,
      details: detailsInner,
      cashAmount,
      nonCashAmount: amountInner - cashAmount
    });
  }

  if (details && details.length) {
    if (calcCashAmount > amountDefault) {
      cashAmount = amountDefault;
    } else {
      cashAmount = calcCashAmount;
    }
    result.push({
      ...commonOderInfo,
      details,
      cashAmount,
      nonCashAmount: amountDefault - cashAmount
    });
  }

  return result;
};

const getMatchMaps = (matchOrders, lastCatProdMaps, product) => {
  for (const order of matchOrders) {
    const matchMaps = lastCatProdMaps.filter(
      lcp => lcp.category.order === order
    );

    if (matchMaps.length) {
      const withCodeMatch = matchMaps.find(
        m => m.code && product.code.includes(m.code)
      );
      if (withCodeMatch) {
        return withCodeMatch;
      }

      const withNameMatch = matchMaps.find(
        m => !m.code && m.name && product.name.includes(m.name)
      );
      if (withNameMatch) {
        return withNameMatch;
      }

      const normalMatch = matchMaps.find(m => !m.code && !m.name);
      if (normalMatch) {
        return normalMatch;
      }
    }
  }
  return;
};

const checkPrices = async (subdomain, preparedDoc, config) => {
  const { type } = preparedDoc;

  if (ORDER_TYPES.SALES.includes(type)) {
    preparedDoc = await checkLoyalties(subdomain, preparedDoc);
    preparedDoc = await checkPricing(subdomain, preparedDoc, config);
    return preparedDoc;
  }

  if (ORDER_TYPES.OUT.includes(type)) {
    for (const item of preparedDoc.items || []) {
      item.discountPercent = 100;
      item.discountAmount = item.count * item.unitPrice;
      item.unitPrice = 0;
    }
  }

  return preparedDoc;
};

export const prepareOrderDoc = async (
  subdomain: string,
  doc: IOrderInput,
  config: IConfigDocument,
  models: IModels
) => {
  const { catProdMappings = [] } = config;

  const items = doc.items.filter(i => !i.isPackage) || [];

  const products: IProductDocument[] = await models.Products.find({
    _id: { $in: items.map(i => i.productId) }
  }).lean();

  const productsOfId: { [_id: string]: IProductDocument } = {};

  for (const prod of products) {
    productsOfId[prod._id] = prod;
  }

  // set unitPrice
  doc.totalAmount = 0;
  for (const item of items) {
    const fixedUnitPrice = Number(
      (
        ((productsOfId[item.productId] || {}).prices || {})[config.token] ||
        item.unitPrice ||
        0
      ).toFixed(2)
    );

    item.unitPrice = fixedUnitPrice;
    doc.totalAmount += (item.count || 0) * fixedUnitPrice;
  }

  const hasTakeItems = items.filter(i => i.isTake);

  if (hasTakeItems.length > 0 && catProdMappings.length > 0) {
    const toAddProducts = {};

    const mapCatIds = catProdMappings
      .filter(cpm => cpm.categoryId)
      .map(cpm => cpm.categoryId);
    const hasTakeProducIds = hasTakeItems.map(hti => hti.productId);
    const hasTakeCatIds = hasTakeProducIds.map(
      htpi => (productsOfId[htpi] || {}).categoryId
    );
    const categories = await models.ProductCategories.find({
      _id: { $in: [...mapCatIds, ...hasTakeCatIds] }
    }).lean();

    const categoriesOfId = {};
    for (const cat of categories) {
      categoriesOfId[cat._id] = cat;
    }
    const lastCatProdMaps = catProdMappings.map(cpm => ({
      ...cpm,
      category: categoriesOfId[cpm.categoryId]
    }));

    for (const item of hasTakeItems) {
      const product = productsOfId[item.productId];
      const category = categoriesOfId[product.categoryId || ''];

      if (!category) {
        continue;
      }

      const perOrders = category.order.split('/');
      const matchOrders: string[] = [];
      for (let i = perOrders.length - 1; i > 0; i--) {
        matchOrders.push(`${perOrders.slice(0, i).join('/')}/`);
      }

      const matchMap = getMatchMaps(matchOrders, lastCatProdMaps, product);
      if (matchMap) {
        const packProductId = matchMap.productId;
        if (packProductId) {
          if (!Object.keys(toAddProducts).includes(packProductId)) {
            toAddProducts[packProductId] = { count: 0 };
          }
          toAddProducts[packProductId].count += item.count;
        }
      }
    }

    const addProductIds = Object.keys(toAddProducts);

    if (addProductIds.length) {
      const takingProducts = await models.Products.find({
        _id: { $in: addProductIds }
      });

      for (const addProduct of takingProducts) {
        const toAddItem = toAddProducts[addProduct._id];

        const fixedUnitPrice = Number(
          ((addProduct.prices || {})[config.token] || 0).toFixed(2)
        );

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

  if (
    doc.type === ORDER_TYPES.DELIVERY &&
    config.deliveryConfig &&
    config.deliveryConfig.productId
  ) {
    const deliveryProd = await models.Products.findOne({
      _id: config.deliveryConfig.productId
    }).lean();
    if (deliveryProd) {
      items.push({
        _id: Math.random().toString(),
        productId: deliveryProd._id,
        count: 1,
        unitPrice: deliveryProd.unitPrice,
        isPackage: true,
        isTake: true
      });
      doc.totalAmount += deliveryProd.unitPrice;
    }
  }

  return await checkPrices(subdomain, { ...doc, items }, config);
};

export const checkOrderStatus = (order: IOrderDocument) => {
  if (order.paidDate) {
    throw new Error('Order is already paid');
  }
};

export const checkOrderAmount = (order: IOrderDocument, amount: number) => {
  const { cashAmount = 0, mobileAmount = 0, paidAmounts } = order;

  const paidAmount =
    cashAmount +
    mobileAmount +
    (paidAmounts || []).reduce((sum, i) => Number(sum) + Number(i.amount), 0);

  if (amount < 0 && paidAmount < order.totalAmount) {
    throw new Error('Amount less 0');
  }

  if (amount > 0 && paidAmount > order.totalAmount) {
    throw new Error('Amount exceeds total amount');
  }

  if (
    paidAmount <= order.totalAmount &&
    paidAmount + amount > order.totalAmount
  ) {
    throw new Error('Amount exceeds total amount');
  }
};

export const reverseItemStatus = async (
  models: IModels,
  items: IOrderItemInput[]
) => {
  let newPreparedDocItems: IOrderItemInput[] = [...items];
  try {
    const oldOrderItems = await models.OrderItems.find({
      _id: { $in: items.map(item => item._id) }
    }).lean();
    if (oldOrderItems) {
      newPreparedDocItems.forEach(async (newItem, index) => {
        const foundItem = oldOrderItems.find(
          oldItem =>
            oldItem._id === newItem._id && oldItem.count < newItem.count
        );
        if (foundItem && foundItem._id) {
          newPreparedDocItems[index].status = ORDER_ITEM_STATUSES.CONFIRM;

          await models.OrderItems.updateOrderItem(foundItem._id, {
            ...foundItem,
            status: ORDER_ITEM_STATUSES.CONFIRM
          });
        }
      });
    }
    return newPreparedDocItems;
  } catch (e) {
    debugError(e);
    return e;
  }
};
