import {
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage
} from '../messageBroker';
import { sendCommonMessage } from '../messageBrokerErkhet';

export const getPureDate = (date: Date) => {
  const ndate = new Date(date);
  const diffTimeZone = Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
};

export const getPostData = async (subdomain, pos, order) => {
  let erkhetConfig = await getConfig(subdomain, 'ERKHET', {});

  if (
    !erkhetConfig ||
    !erkhetConfig.apiKey! ||
    !erkhetConfig.apiSecret ||
    !pos.erkhetConfig ||
    !pos.erkhetConfig.isSyncErkhet
  ) {
    return;
  }

  const details = [] as any;

  const workerEmail =
    (order.userId &&
      (
        await sendCoreMessage({
          subdomain,
          action: 'users.findOne',
          data: { _id: order.userId },
          isRPC: true,
          defaultValue: {}
        })
      ).email) ||
    '';

  const productsIds = order.items.map(item => item.productId);
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

  let sumSaleAmount = 0;

  for (const item of order.items) {
    // if wrong productId then not sent
    if (!productCodeById[item.productId]) {
      continue;
    }

    const amount = item.count * item.unitPrice;
    sumSaleAmount += amount;
    details.push({
      count: item.count,
      amount,
      discount: item.discountAmount,
      inventoryCode: productCodeById[item.productId],
      workerEmail
    });
  }

  const payments: any = {};

  if (order.cashAmount) {
    payments.cashAmount = order.cashAmount;
    sumSaleAmount -= order.cashAmount;
  }
  if (order.receivableAmount) {
    payments.debtAmount = order.receivableAmount;
    sumSaleAmount -= order.receivableAmount;
  }
  if (order.cardAmount) {
    payments.cardAmount = order.cardAmount;
    sumSaleAmount -= order.cardAmount;
  }
  if (order.mobileAmount) {
    payments.mobileAmount = order.mobileAmount;
    sumSaleAmount -= order.mobileAmount;
  }

  if (sumSaleAmount > 0.005) {
    payments[pos.erkhetConfig.defaultPay] = sumSaleAmount;
  }

  const orderInfos = [
    {
      date: getPureDate(order.paidDate)
        .toISOString()
        .slice(0, 10),
      orderId: order._id,
      hasVat: order.taxInfo
        ? order.taxInfo.hasVat
        : pos.ebarimtConfig && pos.ebarimtConfig.hasVat
        ? true
        : false,
      hasCitytax: order.taxInfo
        ? order.taxInfo.hasCitytax
        : pos.ebarimtConfig && pos.ebarimtConfig.hasCitytax
        ? true
        : false,
      billType: order.billType,
      customerCode: (
        (await sendContactsMessage({
          subdomain,
          action: 'customers.findOne',
          data: {
            _id: order.customerId
          },
          isRPC: true,
          defaultValue: {}
        })) || {}
      ).code,
      description: `${pos.name}`,
      number: `${pos.erkhetConfig.beginNumber || ''}${order.number}`,
      details,
      ...payments
    }
  ];

  let userEmail = pos.erkhetConfig.userEmail;

  return {
    userEmail,
    token: erkhetConfig.apiToken,
    apiKey: erkhetConfig.apiKey,
    apiSecret: erkhetConfig.apiSecret,
    orderInfos: JSON.stringify(orderInfos)
  };
};

export const orderDeleteToErkhet = async (subdomain, pos, order) => {
  let erkhetConfig = await getConfig(subdomain, 'ERKHET', {});

  if (
    !erkhetConfig ||
    !erkhetConfig.apiKey! ||
    !erkhetConfig.apiSecret ||
    !pos.erkhetConfig.isSyncErkhet
  ) {
    return;
  }

  const orderInfos = [
    {
      date: order.paidDate,
      orderId: order._id,
      returnKind: 'hard'
    }
  ];

  let userEmail = pos.erkhetConfig.userEmail;

  const postData = {
    userEmail,
    token: erkhetConfig.apiToken,
    apiKey: erkhetConfig.apiKey,
    apiSecret: erkhetConfig.apiSecret,
    orderInfos: JSON.stringify(orderInfos)
  };

  return await sendCommonMessage('rpc_queue:erxes-automation-erkhet', {
    action: 'get-response-return-order',
    isJson: true,
    isEbarimt: false,
    payload: JSON.stringify(postData),
    thirdService: true
  });
};
