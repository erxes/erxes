import { sendRequest } from '@erxes/api-utils/src';
import {
  sendCoreMessage,
  sendNotificationsMessage,
  sendContactsMessage,
  sendProductsMessage
} from './messageBroker';

export const sendNotification = (subdomain: string, data) => {
  return sendNotificationsMessage({ subdomain, action: 'send', data });
};

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
};

export const validCompanyCode = async (config, companyCode) => {
  let result = '';

  const re = new RegExp('(^[А-ЯЁӨҮ]{2}[0-9]{8}$)|(^\\d{7}$)', 'gui');

  if (re.test(companyCode)) {
    const response = await sendRequest({
      url: config.checkCompanyUrl,
      method: 'GET',
      params: { regno: companyCode }
    });

    if (response.found) {
      result = response.name;
    }
  }
  return result;
};

export const companyCheckCode = async (params, subdomain) => {
  if (!params.code) {
    return;
  }

  const config = await getConfig(subdomain, 'EBARIMT', {});

  if (
    !config ||
    !config.checkCompanyUrl ||
    !config.checkCompanyUrl.includes('http')
  ) {
    return;
  }

  const companyName = await validCompanyCode(config, params.code);

  if (!companyName) {
    throw new Error(`Байгууллагын код буруу бөглөсөн байна. "${params.code}"`);
  }

  if (companyName.includes('**') && params.primaryName) {
    return params;
  }

  params.primaryName = companyName;
  return params;
};

export const validConfigMsg = async config => {
  if (!config.url) {
    return 'required url';
  }
  return '';
};

export const isValidBarcode = (barcode: string): boolean => {
  // check length
  if (
    barcode.length < 8 ||
    barcode.length > 18 ||
    (barcode.length != 8 &&
      barcode.length != 12 &&
      barcode.length != 13 &&
      barcode.length != 14 &&
      barcode.length != 18)
  ) {
    return false;
  }

  const lastDigit = Number(barcode.substring(barcode.length - 1));
  let checkSum = 0;
  if (isNaN(lastDigit)) {
    return false;
  } // not a valid upc/ean

  const arr: any = barcode
    .substring(0, barcode.length - 1)
    .split('')
    .reverse();
  let oddTotal = 0,
    evenTotal = 0;

  for (var i = 0; i < arr.length; i++) {
    if (isNaN(arr[i])) {
      return false;
    } // can't be a valid upc/ean we're checking for

    if (i % 2 == 0) {
      oddTotal += Number(arr[i]) * 3;
    } else {
      evenTotal += Number(arr[i]);
    }
  }
  checkSum = (10 - ((evenTotal + oddTotal) % 10)) % 10;

  // true if they are equal
  return checkSum == lastDigit;
};

const arrangeTaxType = async (deal, productsById, billType) => {
  const details: any[] = [];
  const detailsFree: any[] = [];
  const details0: any[] = [];
  let amount = 0;
  let amountFree = 0;
  let amount0 = 0;

  for (const productData of deal.productsData) {
    // not tickUsed product not sent
    if (!productData.tickUsed) {
      continue;
    }

    const product = productsById[productData.productId];

    // if wrong productId then not sent
    if (!product) {
      continue;
    }

    const stock = {
      count: productData.quantity,
      amount: productData.amount,
      discount: productData.discount,
      productCode: product.code,
      productName: product.name,
      sku: product.sku || 'ш',
      productId: productData.productId
    };

    if (product.taxType === '2') {
      detailsFree.push({ ...stock, barcode: product.taxCode });
      amountFree += productData.amount;
    } else if (product.taxType === '3' && billType === '3') {
      details0.push({ ...stock, barcode: product.taxCode });
      amount0 += productData.amount;
    } else {
      let trueBarcode = '';
      for (const barcode of product.barcodes || []) {
        if (isValidBarcode(barcode)) {
          trueBarcode = barcode;
          continue;
        }
      }
      details.push({ ...stock, barcode: trueBarcode });
      amount += productData.amount;
    }
  }

  return {
    details,
    detailsFree,
    details0,
    amount,
    amountFree,
    amount0
  };
};

export const getPostData = async (subdomain, config, deal) => {
  let billType = '1';
  let customerCode = '';
  let customerName = '';

  const companyIds = await sendCoreMessage({
    subdomain,
    action: 'conformities.savedConformity',
    data: { mainType: 'deal', mainTypeId: deal._id, relTypes: ['company'] },
    isRPC: true,
    defaultValue: []
  });

  if (companyIds.length > 0) {
    const companies = await sendContactsMessage({
      subdomain,
      action: 'companies.findActiveCompanies',
      data: {
        selector: { _id: { $in: companyIds } },
        fields: { _id: 1, code: 1 }
      },
      isRPC: true,
      defaultValue: []
    });

    const re = new RegExp('(^[А-ЯЁӨҮ]{2}[0-9]{8}$)|(^\\d{7}$)', 'gui');
    for (const company of companies) {
      if (re.test(company.code)) {
        const checkCompanyRes = await sendRequest({
          url: config.checkCompanyUrl,
          method: 'GET',
          params: { regno: company.code }
        });

        if (checkCompanyRes.found) {
          billType = '3';
          customerCode = company.code;
          customerName = company.primaryName;
          continue;
        }
      }
    }
  }

  if (billType === '1') {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: { mainType: 'deal', mainTypeId: deal._id, relTypes: ['customer'] },
      isRPC: true,
      defaultValue: []
    });

    if (customerIds.length > 0) {
      const customers = await sendContactsMessage({
        subdomain,
        action: 'customers.findActiveCustomers',
        data: {
          selector: { _id: { $in: customerIds } },
          fields: { _id: 1, code: 1 }
        },
        isRPC: true,
        defaultValue: []
      });
      const customer = customers.find(c => c.code && c.code.match(/^\d{8}$/g));

      customerCode = (customer && customer.code) || '';
    }
  }

  const productsIds = deal.productsData.map(item => item.productId);
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
    amount,
    amountFree,
    amount0
  } = await arrangeTaxType(deal, productsById, billType);

  const date = new Date();
  const commonOderInfo = {
    number: deal.number,
    date:
      date.toISOString().split('T')[0] +
      ' ' +
      date.toTimeString().split(' ')[0],
    orderId: deal._id,
    hasVat: config.hasVat || false,
    hasCitytax: config.hasCitytax || false,
    billType,
    customerCode,
    customerName,
    description: deal.name,
    ebarimtResponse: {},
    contentType: 'deal',
    contentId: deal._id
  };

  const result: any[] = [];
  let calcCashAmount = (deal.paymentsData || {}).cashAmount || 0;
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
