import { IModels } from './connectionResolver';
import messageBroker, { sendPosclientMessage } from './messageBroker';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage
} from './messageBroker';

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
};

export const getPureDate = (date: Date) => {
  const ndate = new Date(date);
  const diffTimeZone = Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const getFullDate = (date: Date) => {
  const ndate = getPureDate(date);
  const year = ndate.getFullYear();
  const month = ndate.getMonth();
  const day = ndate.getDate();

  const today = new Date(year, month, day);
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getTomorrow = (date: Date) => {
  return getFullDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));
};

export const orderToErkhet = async (
  subdomain,
  models,
  messageBroker,
  pos,
  orderId,
  putRes
) => {
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

  const order = await models.PosOrders.findOne({ _id: orderId }).lean();

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
      hasVat: putRes.vat ? true : false,
      hasCitytax: putRes.citytax ? true : false,
      billType: order.billType,
      customerCode: (
        await sendContactsMessage({
          subdomain,
          action: 'customers.findOne',
          data: {
            _id: order.customerId
          },
          isRPC: true,
          defaultValue: {}
        })
      ).code,
      description: `${pos.name}`,
      number: `${pos.erkhetConfig.beginNumber || ''}${order.number}`,
      details,
      ...payments
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

  // TODO: syncerkhet pluginaar
  const apiResponse = await messageBroker().sendRPCMessage(
    'rpc_queue:erxes-automation-erkhet',
    {
      action: 'get-response-send-order-info',
      isJson: true,
      isEbarimt: false,
      payload: JSON.stringify(postData),
      thirdService: true
    }
  );

  if (apiResponse) {
    if (apiResponse.success) {
      await models.PosOrders.updateOne(
        { _id: orderId },
        { syncedErkhet: true }
      );
    }
    if (apiResponse.message) {
      throw new Error(apiResponse.message);
    }
  }
};

export const orderDeleteToErkhet = async (
  models,
  messageBroker,
  subdomain,
  pos,
  orderId
) => {
  let erkhetConfig = await getConfig(subdomain, 'ERKHET', {});

  if (
    !erkhetConfig ||
    !erkhetConfig.apiKey! ||
    !erkhetConfig.apiSecret ||
    !pos.erkhetConfig.isSyncErkhet
  ) {
    return;
  }

  const order = await models.PosOrders.findOne({ _id: orderId }).lean();

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

  const apiResponse = await messageBroker().sendRPCMessage(
    'rpc_queue:erxes-automation-erkhet',
    {
      action: 'get-response-return-order',
      isJson: true,
      isEbarimt: false,
      payload: JSON.stringify(postData),
      thirdService: true
    }
  );

  if (apiResponse) {
    if (apiResponse.success) {
      return apiResponse.success;
    } else {
      throw new Error(apiResponse);
    }
  }
};

export const getChildCategories = async (subdomain: string, categoryIds) => {
  let catIds: string[] = [];
  for (const categoryId of categoryIds) {
    const childs = await sendProductsMessage({
      subdomain,
      action: 'categories.withChilds',
      data: { _id: categoryId },
      isRPC: true,
      defaultValue: []
    });

    catIds = catIds.concat((childs || []).map(ch => ch._id) || []);
  }

  return Array.from(new Set(catIds));
};

export const getBranchesUtil = async (
  subdomain: string,
  models: IModels,
  posToken: string
) => {
  const pos = await models.Pos.findOne({ token: posToken }).lean();

  if (!pos) {
    return { error: 'not found pos' };
  }

  const allowsPos = await models.Pos.find({
    isOnline: { $ne: true },
    branchId: { $in: pos.allowBranchIds }
  }).lean();

  const healthyBranchIds = [] as any;

  for (const allowPos of allowsPos) {
    const syncIds = Object.keys(allowPos.syncInfos || {}) || [];

    if (!syncIds.length) {
      continue;
    }

    for (const syncId of syncIds) {
      const syncDate = allowPos.syncInfos[syncId];

      // expired sync 72 hour
      if ((new Date().getTime() - syncDate.getTime()) / (60 * 60 * 1000) > 72) {
        continue;
      }

      const longTask = async () =>
        await messageBroker().sendRPCMessage(
          `posclient:health_check_${syncId}`,
          {
            thirdService: true
          }
        );

      const timeout = (cb, interval) => () =>
        new Promise(resolve => setTimeout(() => cb(resolve), interval));

      const onTimeout = timeout(resolve => resolve({}), 3000);

      let response = { healthy: 'down' };
      await Promise.race([longTask, onTimeout].map(f => f())).then(
        result => (response = result as { healthy: string })
      );

      if (response.healthy === 'ok') {
        healthyBranchIds.push(allowPos.branchId);
        break;
      }
    }
  }

  return await sendCoreMessage({
    subdomain,
    action: 'branches.find',
    data: { query: { _id: { $in: healthyBranchIds } } },
    isRPC: true,
    defaultValue: []
  });
};
