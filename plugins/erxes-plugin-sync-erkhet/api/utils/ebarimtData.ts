import { sendRequest } from 'erxes-api-utils';

export const validConfigMsg = async (config) => {
  if (!config.url){
    return 'required url';
  }
  return '';
}


export const getPostData = async (models, config, deal) => {
  let billType = 1;
  let customerCode = '';

  const companyIds = await models.Conformities.savedConformity({ mainType: 'deal', mainTypeId: deal._id, relTypes: ['company'] });
  if (companyIds.length > 0) {
    const companies = await models.Companies.find({ _id: { $in: companyIds } }) || [];
    const re = new RegExp('(^[А-ЯЁӨҮ]{2}[0-9]{8}$)|(^\\d{7}$)', 'gui');
    for (const company of companies) {

      if (re.test(company.code)) {
        const checkCompanyRes = await sendRequest({
          url: config.checkCompanyUrl,
          method: 'GET',
          params: { regno: company.code },
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
    const customerIds = await models.Conformities.savedConformity({ mainType: 'deal', mainTypeId: deal._id, relTypes: ['customer'] });
    if (customerIds.length > 0) {
      const customers = await models.Customers.find({ _id: { $in: customerIds } });
      customerCode = customers.length > 0 ? customers[0].code : '' || '';
    }
  }

  const assignUserIds = deal.productsData.filter(item => item.assignUserId).map(item => item.assignUserId);
  const assignUsers = await models.Users.find({ _id: { $in: assignUserIds } });
  const userEmailById = {};
  for (const user of assignUsers) {
    userEmailById[user._id] = user.email;
  }

  const productsIds = deal.productsData.map(item => item.productId);
  const products = await models.Products.find({ _id: { $in: productsIds } });

  const productCodeById = {};
  for (const product of products) {
    productCodeById[product._id] = product.code;
  }

  const details = [];

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
      workerEmail: productData.assignUserId && userEmailById[productData.assignUserId],
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
    other: 'debtAmount',
  };

  let sumSaleAmount = details.reduce((predet, detail) => {
    return { amount: predet.amount + detail.amount };
  }).amount;

  for (const paymentKind of Object.keys(deal.paymentsData || [])) {
    const payment = deal.paymentsData[paymentKind];
    payments[configure[paymentKind]] = (payments[configure[paymentKind]] || 0) + payment.amount;
    sumSaleAmount = sumSaleAmount - payment.amount;
  }

  // if payments is less sum sale amount then create debt
  if (sumSaleAmount > 0.005) {
    payments[config.defaultPay] = (payments[config.defaultPay] || 0) + sumSaleAmount;
  }

  const orderInfos = [
    {
      date: new Date().toISOString().slice(0, 10),
      orderId: deal._id,
      hasVat: config.hasVat || false,
      hasCitytax: config.hasCitytax || false,
      billType,
      customerCode,
      description: deal.name,
      details,
      ...payments,
    },
  ];

  return {
    userEmail: config.userEmail,
    token: config.apiToken,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    orderInfos: JSON.stringify(orderInfos),
  };
}