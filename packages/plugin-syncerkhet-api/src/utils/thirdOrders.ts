import { getSubdomain } from "@erxes/api-utils/src/core";
import { IModels, generateModels } from "../connectionResolver";
import { sendCoreMessage } from "../messageBroker";
import { sendRPCMessage } from "../messageBrokerErkhet";
import { getConfig, getPureDate } from "./utils";

export const getPostData = async (subdomain, userEmail, order) => {
  let erkhetConfig = await getConfig(subdomain, "ERKHET", {});

  if (!erkhetConfig?.apiKey || !erkhetConfig?.apiSecret) {
    return;
  }

  const details = [] as any;

  const workerEmail =
    (order.userId &&
      (
        await sendCoreMessage({
          subdomain,
          action: "users.findOne",
          data: { _id: order.userId },
          isRPC: true,
          defaultValue: {}
        })
      ).email) ||
    "";

  const productsIds = order.details.map(item => item.productId);
  const products = await sendCoreMessage({
    subdomain,
    action: "products.find",
    data: { query: { _id: { $in: productsIds } } },
    isRPC: true,
    defaultValue: []
  });

  const productCodeById = {};
  for (const product of products) {
    productCodeById[product._id] = product.code;
  }

  let sumSaleAmount = 0;

  for (const item of order.details) {
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

  const { payments } = order;
  const allowKeys = [
    "cardAmount",
    "card2Amount",
    "cashAmount",
    "mobileAmount",
    "debtBarterAmount"
    // 'debtAmount',
  ];

  for (const key of payments) {
    if (allowKeys.includes(key)) {
      sumSaleAmount -= payments[key];
    }
  }

  if (sumSaleAmount > 0.005) {
    payments.debtAmount = sumSaleAmount;
  } else if (sumSaleAmount < -0.005) {
    throw new Error("overpayment");
  }

  const orderInfos = [
    {
      date: getPureDate(order.paidDate).toISOString().slice(0, 10),
      orderId: order._id,
      hasVat: order.hasVat,
      hasCitytax: order.hasCitytax,
      billType: order.billType,
      customerCode: order.customerCode,
      description: order.description,
      number: order.number,
      details,
      ...payments
    }
  ];

  return {
    userEmail,
    token: erkhetConfig.apiToken,
    apiKey: erkhetConfig.apiKey,
    apiSecret: erkhetConfig.apiSecret,
    orderInfos: JSON.stringify(orderInfos)
  };
};

export const thirdOrderToErkhet = async (
  subdomain: string,
  models: IModels,
  data
) => {
  const { userEmail, order } = data;
  const syncLogDoc = {
    contentType: "pos:order",
    createdAt: new Date(),
    createdBy: order.userId
  };
  const syncLog = await models.SyncLogs.syncLogsAdd({
    ...syncLogDoc,
    contentId: order._id,
    consumeData: order,
    consumeStr: JSON.stringify(order)
  });
  try {
    const postData = await getPostData(subdomain, userEmail, order);
    if (!postData) {
      return {
        status: "success",
        data: {}
      };
    }

    return {
      status: "success",
      data: await sendRPCMessage(
        models,
        syncLog,
        "rpc_queue:erxes-automation-erkhet",
        {
          action: "get-response-send-order-info",
          isEbarimt: false,
          payload: JSON.stringify(postData),
          thirdService: true,
          isJson: true
        }
      )
    };
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } }
    );
    return {
      status: "success",
      data: { error: e.message }
    };
  }
};

export const thirdOrder = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const { body } = req;
  thirdOrderToErkhet(subdomain, models, body);
};
