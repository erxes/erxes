import { sendProductsMessage } from './messageBroker';
import { isValidBarcode } from './utils';

const arrangeTaxType = async (orderInfo, productsById, billType) => {
  const details: any[] = [];
  const detailsFree: any[] = [];
  const details0: any[] = [];
  const detailsInner: any[] = [];
  let amount = 0;
  let amountFree = 0;
  let amount0 = 0;
  let amountInner = 0;

  for (const detail of orderInfo.details) {
    const product = productsById[detail.productId];

    // if wrong productId then not sent
    if (!product) {
      continue;
    }

    const stock = {
      count: detail.count,
      amount: detail.amount,
      discount: detail.discount,
      productCode: product.code,
      productName: product.name,
      uom: product.uom || 'ш',
      productId: detail.productId
    };

    if (product.taxType === '2') {
      detailsFree.push({ ...stock, barcode: product.taxCode });
      amountFree += detail.amount;
    } else if (product.taxType === '3' && billType === '3') {
      details0.push({ ...stock, barcode: product.taxCode });
      amount0 += detail.amount;
    } else if (product.taxType === '5') {
      detailsInner.push({ ...stock });
      amountInner += product.amount;
    } else {
      let trueBarcode = '';
      for (const barcode of product.barcodes || []) {
        if (isValidBarcode(barcode)) {
          trueBarcode = barcode;
          continue;
        }
      }
      details.push({ ...stock, barcode: trueBarcode });
      amount += detail.amount;
    }
  }

  return {
    details,
    detailsFree,
    details0,
    detailsInner,
    amount,
    amountFree,
    amount0,
    amountInner
  };
};

export const getPostDataCommon = async (
  subdomain,
  config,
  contentType,
  contentId,
  orderInfo
) => {
  let billType = orderInfo.billType || '1';
  let customerCode = orderInfo.customerCode || '';
  let customerName = orderInfo.customerName || '';

  const productsIds = orderInfo.details.map(item => item.productId);
  const products = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: { query: { _id: { $in: productsIds } }, limit: productsIds.length },
    isRPC: true,
    defaultValue: []
  });

  const productsById = {};
  for (const product of products) {
    productsById[product._id] = product;
  }

  const {
    details,
    detailsFree,
    details0,
    detailsInner,
    amount,
    amountFree,
    amount0,
    amountInner
  } = await arrangeTaxType(orderInfo, productsById, billType);

  const date = new Date();
  const commonOderInfo = {
    number: orderInfo.number,
    date:
      date.toISOString().split('T')[0] +
      ' ' +
      date.toTimeString().split(' ')[0],
    orderId: orderInfo._id,
    hasVat: config.hasVat || false,
    hasCitytax: config.hasCitytax || false,
    billType,
    customerCode,
    customerName,
    description: orderInfo.description,
    ebarimtResponse: {},
    contentType,
    contentId
  };

  const result: any[] = [];
  let calcCashAmount = orderInfo.cashAmount || 0;
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
      inner: true,
      hasVat: false,
      hasCitytax: false,
      details: detailsInner,
      cashAmount,
      nonCashAmount: amountInner - cashAmount
    });
  }

  if (details && details.length) {
    if (calcCashAmount > amount) {
      cashAmount = amount;
    } else {
      cashAmount = calcCashAmount;
    }
    result.push({
      ...commonOderInfo,
      details,
      cashAmount,
      nonCashAmount: amount - cashAmount
    });
  }
  return result;
};
