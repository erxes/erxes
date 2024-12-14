import { generateModels } from "../connectionResolver";
import {
  sendCoreMessage
} from "../messageBroker";
import { sendRPCMessage } from "../messageBrokerErkhet";
import { calcProductsTaxRule } from "./productsByTaxType";
import { getConfig, getPureDate } from "./utils";

export const getPostData = async (subdomain, pos, order) => {
  let erkhetConfig = await getConfig(subdomain, "ERKHET", {});

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
          action: "users.findOne",
          data: { _id: order.userId },
          isRPC: true,
          defaultValue: {}
        })
      ).email) ||
    "";

  const productsIds = order.items.map(item => item.productId);
  const products = await sendCoreMessage({
    subdomain,
    action: "products.find",
    data: { query: { _id: { $in: productsIds } } },
    isRPC: true,
    defaultValue: []
  });

  const { productsById, oneMoreCtax, oneMoreVat } = await calcProductsTaxRule(subdomain, pos.ebarimtConfig, products)

  let sumSaleAmount = 0;

  for (const item of order.items) {
    // if wrong productId then not sent
    const product = productsById[item.productId]
    if (!product) {
      continue;
    }

    const amount = item.count * item.unitPrice;
    sumSaleAmount += amount;
    details.push({
      count: item.count,
      amount,
      discount: item.discountAmount,
      inventoryCode: product.code,
      workerEmail,
      taxRule: product.taxRule
    });
  }

  const payments: any = {};

  if (order.cashAmount) {
    payments.cashAmount = order.cashAmount;
    sumSaleAmount -= order.cashAmount;
  }
  if (order.mobileAmount) {
    payments.mobileAmount = order.mobileAmount;
    sumSaleAmount -= order.mobileAmount;
  }

  for (const paidAmount of order.paidAmounts || []) {
    const erkhetType = pos.erkhetConfig[`_${paidAmount.type}`];
    if (!erkhetType) {
      continue;
    }

    payments[erkhetType] = (payments[erkhetType] || 0) + paidAmount.amount;
    sumSaleAmount -= paidAmount.amount;
  }

  if (sumSaleAmount > 0.005 || sumSaleAmount < -0.005) {
    payments[pos.erkhetConfig.defaultPay] =
      (payments[pos.erkhetConfig.defaultPay] || 0) + sumSaleAmount;
  }

  let customerCode = "";
  if (order.customerId) {
    const customerType = order.customerType || "customer";
    if (customerType === "company") {
      customerCode = (
        await sendCoreMessage({
          subdomain,
          action: "companies.findOne",
          data: {
            _id: order.customerId
          },
          isRPC: true,
          defaultValue: {}
        })
      )?.code;
    } else {
      customerCode = (
        await sendCoreMessage({
          subdomain,
          action: "customers.findOne",
          data: {
            _id: order.customerId
          },
          isRPC: true,
          defaultValue: {}
        })
      )?.code;
    }
  }

  const orderInfos = [
    {
      date: getPureDate(order.paidDate).toISOString().slice(0, 10),
      orderId: order._id,
      hasVat: (
        order.taxInfo
          ? order.taxInfo.hasVat
          : pos.ebarimtConfig?.hasVat
      ) || oneMoreVat || false,
      hasCitytax: (
        order.taxInfo
          ? order.taxInfo.hasCitytax
          : pos.ebarimtConfig?.hasCitytax
      ) || oneMoreCtax || false,
      billType: order.billType,
      customerCode,
      description: `${pos.name}`,
      number: `${pos.erkhetConfig.beginNumber || ""}${order.number}`,
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
  let erkhetConfig = await getConfig(subdomain, "ERKHET", {});
  const models = await generateModels(subdomain);

  if (
    !erkhetConfig ||
    !erkhetConfig.apiKey! ||
    !erkhetConfig.apiSecret ||
    !pos.erkhetConfig.isSyncErkhet
  ) {
    return;
  }

  const syncLog = await models.SyncLogs.syncLogsAdd({
    contentType: "pos:order",
    createdAt: new Date(),
    contentId: order._id,
    consumeData: order,
    consumeStr: JSON.stringify(order)
  });
  try {
    const orderInfos = [
      {
        date: order.paidDate,
        orderId: order._id,
        returnKind: "hard"
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

    return await sendRPCMessage(
      models,
      syncLog,
      "rpc_queue:erxes-automation-erkhet",
      {
        action: "get-response-return-order",
        isJson: true,
        isEbarimt: false,
        payload: JSON.stringify(postData),
        thirdService: true
      }
    );
  } catch (e) {
    await models.SyncLogs.updateOne(
      { _id: syncLog._id },
      { $set: { error: e.message } }
    );
  }
};
