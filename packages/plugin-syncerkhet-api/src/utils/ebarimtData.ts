import { sendRequest } from '@erxes/api-utils/src/requests';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage
} from '../messageBroker';

export const validConfigMsg = async config => {
  if (!config.url) {
    return 'required url';
  }
  return '';
};

export const getPostData = async (subdomain, config, deal, isNow = true) => {
  let billType = 1;
  let customerCode = '';

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
          billType = 3;
          customerCode = company.code;
          continue;
        }
      }
    }
  }

  if (billType === 1) {
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

      customerCode = customers.length > 0 ? customers[0].code : '' || '';
    }
  }

  const assignUserIds = deal.productsData
    .filter(item => item.assignUserId)
    .map(item => item.assignUserId);

  const assignUsers = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: { query: { _id: { $in: assignUserIds } } },
    isRPC: true,
    defaultValue: []
  });

  const userEmailById = {};
  for (const user of assignUsers) {
    userEmailById[user._id] = user.email;
  }

  const productsIds = deal.productsData.map(item => item.productId);

  const products = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: { query: { _id: { $in: productsIds } } },
    isRPC: true,
    defaultValue: []
  });

  const productCodeById = {};
  for (const product of products) {
    productCodeById[product._id] = product.code;
  }

  const details: any = [];

  for (const productData of deal.productsData) {
    // not tickUsed product not sent
    if (!productData.tickUsed) {
      continue;
    }

    // if wrong productId then not sent
    if (!productCodeById[productData.productId]) {
      continue;
    }

    details.push({
      count: productData.quantity,
      amount: productData.amount,
      discount: productData.discount,
      inventoryCode: productCodeById[productData.productId],
      workerEmail:
        productData.assignUserId && userEmailById[productData.assignUserId]
    });
  }

  // debit payments coll
  const payments = {};
  const configure = {
    prepay: 'preAmount',
    cash: 'cashAmount',
    bank: 'mobileAmount',
    pos: 'cardAmount',
    wallet: 'debtAmount',
    barter: 'debtBarterAmount',
    after: 'debtAmount',
    other: 'debtAmount'
  };

  let sumSaleAmount = details.reduce((predet, detail) => {
    return { amount: predet.amount + detail.amount };
  }).amount;

  for (const paymentKind of Object.keys(deal.paymentsData || [])) {
    const payment = deal.paymentsData[paymentKind];
    payments[configure[paymentKind]] =
      (payments[configure[paymentKind]] || 0) + payment.amount;
    sumSaleAmount = sumSaleAmount - payment.amount;
  }

  // if payments is less sum sale amount then create debt
  if (sumSaleAmount > 0.005) {
    payments[config.defaultPay] =
      (payments[config.defaultPay] || 0) + sumSaleAmount;
  }

  const orderInfos = [
    {
      date: isNow
        ? new Date().toISOString().slice(0, 10)
        : new Date(deal.stageChangedDate).toISOString().slice(0, 10),
      orderId: deal._id,
      number: deal.number || '',
      hasVat: config.hasVat || false,
      hasCitytax: config.hasCitytax || false,
      billType,
      customerCode,
      description: deal.name,
      details,
      ...payments
    }
  ];

  return {
    userEmail: config.userEmail,
    token: config.apiToken,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    orderInfos: JSON.stringify(orderInfos)
  };
};
