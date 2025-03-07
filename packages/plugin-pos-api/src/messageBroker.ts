import { afterMutationHandlers } from "./afterMutations";
import { getBranchesUtil, statusToDone, syncOrderFromClient } from "./utils";
import { generateModels } from "./connectionResolver";
import { IPosDocument } from "./models/definitions/pos";
import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage
} from "@erxes/api-utils/src/core";

import { beforeResolverHandlers } from "./beforeResolvers";
import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";

export const setupMessageConsumers = async () => {
  consumeQueue("pos:afterMutation", async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeQueue("pos:createOrUpdateOrders", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { action, posToken, responses, order, items } = data;
    const pos = await models.Pos.findOne({ token: posToken }).lean();

    if (!pos) {
      throw new Error(`Pos token=${posToken} not found`);
    }

    // ====== if (action === 'statusToDone')
    // if (doneOrder.type === 'delivery' && doneOrder.status === 'done') { }
    if (action === "statusToDone") {
      return await statusToDone({ subdomain, models, order, pos });
    }

    // ====== if (action === 'makePayment')
    await syncOrderFromClient({
      subdomain,
      models,
      order,
      items,
      pos,
      posToken,
      responses
    });

    return {
      status: "success"
    };
  });

  consumeQueue("pos:createOrUpdateOrdersMany", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { posToken, syncOrders } = data;
    const pos = await models.Pos.findOne({ token: posToken }).lean();

    if (!pos) {
      throw new Error(`Pos token=${posToken} not found`);
    }

    for (const perData of syncOrders) {
      const { responses, order, items } = perData;
      try {
        await syncOrderFromClient({
          subdomain,
          models,
          order,
          items,
          pos,
          posToken,
          responses
        });
      } catch (e) {
        console.log(
          `createOrUpdateOrdersMany per warning: ${e.message}, #${order?.number}`
        );
      }
    }

    return {
      status: "success"
    };
  });

  consumeRPCQueue(
    "pos:getModuleRelation",
    async ({ data: { module, target } }) => {
      // need to check pos-order or pos

      let filter;

      if (module.includes("contacts")) {
        if (target.customerId) {
          filter = { _id: target.customerId };
        }
      }

      return {
        status: "success",
        data: filter
      };
    }
  );

  consumeRPCQueue("pos:findSlots", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.PosSlots.find({ posId: data.posId }).lean()
    };
  });

  consumeRPCQueue(
    "pos:orders.updateOne",
    async ({ subdomain, data: { selector, modifier } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.PosOrders.updateOne(selector, modifier)
      };
    }
  );

  consumeRPCQueue("pos:ecommerceGetBranches", async ({ subdomain, data }) => {
    const { posToken } = data;

    const models = await generateModels(subdomain);
    return {
      status: "success",
      data: await getBranchesUtil(subdomain, models, posToken)
    };
  });

  consumeRPCQueue("pos:ordersDeliveryInfo", async ({ subdomain, data }) => {
    const { orderId } = data;
    const models = await generateModels(subdomain);

    const order = await models.PosOrders.findOne({ _id: orderId }).lean();

    if (!order) {
      throw new Error(`PosOrder ${orderId} not found`);
    }

    // on kitchen
    if (!order.deliveryInfo) {
      return {
        status: "success",
        data: {
          error: "Deleted delivery information."
        }
      };
    }

    if (!order.deliveryInfo.dealId) {
      return {
        status: "success",
        data: {
          _id: order._id,
          status: "onKitchen",
          date: order.paidDate,
          description: order.description
        }
      };
    }

    const dealId = order.deliveryInfo.dealId;
    const deal = await sendSalesMessage({
      subdomain,
      action: "deals.findOne",
      data: { _id: dealId },
      isRPC: true
    });

    if (!deal) {
      return {
        status: "success",
        data: {
          error: "Deleted delivery information."
        }
      };
    }

    const stage = await sendSalesMessage({
      subdomain,
      action: "stages.findOne",
      data: { _id: deal.stageId },
      isRPC: true
    });

    return {
      status: "success",
      data: {
        _id: order._id,
        status: stage.name,
        date: deal.stageChangedDate || deal.modifiedDate || deal.createdAt,
        description: order.description
      }
    };
  });

  consumeRPCQueue("pos:orders.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      status: "success",
      data: await models.PosOrders.find(data).lean()
    };
  });

  consumeRPCQueue("pos:orders.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      status: "success",
      data: await models.PosOrders.findOne(data).lean()
    };
  });

  consumeRPCQueue("pos:orders.aggregate", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { aggregate, replacers } = data;
    for (const repl of replacers || []) {
      try {
        eval(repl);
      } catch (e) {}
    }

    return {
      status: "success",
      data: await models.PosOrders.aggregate(aggregate)
    };
  });

  consumeRPCQueue("pos:configs.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      status: "success",
      data: await models.Pos.find(data).lean()
    };
  });

  consumeRPCQueue("pos:configs.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      status: "success",
      data: await models.Pos.findOne(data).lean()
    };
  });

  consumeRPCQueue("pos:covers.confirm", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { cover } = data;
    await models.Covers.updateOne(
      { _id: cover._id },
      { ...cover },
      { upsert: true }
    );
    return {
      status: "success",
      data: await models.Covers.findOne({ _id: cover._id })
    };
  });

  consumeRPCQueue("pos:beforeResolver", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      data: await beforeResolverHandlers(models, subdomain, data),
      status: "success"
    };
  });
};

export const sendSalesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "sales",
    ...args
  });
};

export const sendLoyaltiesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "loyalties",
    ...args
  });
};

export const sendPricingMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "pricing",
    ...args
  });
};

export const sendEbarimtMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "ebarimt",
    ...args
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};

export const sendInventoriesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "inventories",
    ...args
  });
};

export const sendSyncerkhetMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "syncerkhet",
    ...args
  });
};

export const sendPosclientMessage = async (
  args: MessageArgsOmitService & { pos: IPosDocument }
) => {
  const { action, pos } = args;
  let lastAction = action;
  let serviceName = "posclient";

  const { ALL_AUTO_INIT } = process.env;

  if (
    ![true, "true", "True", "1"].includes(ALL_AUTO_INIT || "") &&
    !pos.onServer
  ) {
    lastAction = `posclient:${action}_${pos.token}`;
    serviceName = "";
    args.data.thirdService = true;
    args.isMQ = true;

    if (args.isRPC) {
      const response = await sendPosclientHealthCheck(args);
      if (!response || response.healthy !== "ok") {
        throw new Error("syncing error not connected posclient");
      }
    }
  }

  args.data.token = pos.token;

  return await sendMessage({
    serviceName,
    ...args,
    action: lastAction
  });
};

export const sendPosclientHealthCheck = async ({
  subdomain,
  pos
}: {
  subdomain: string;
  pos: IPosDocument;
}) => {
  const { ALL_AUTO_INIT } = process.env;

  if (
    [true, "true", "True", "1"].includes(ALL_AUTO_INIT || "") ||
    pos.onServer
  ) {
    return { healthy: "ok" };
  }

  return await sendMessage({
    subdomain,
    isRPC: true,
    isMQ: true,
    serviceName: "",
    action: `posclient:health_check_${pos.token}`,
    data: { token: pos.token, thirdService: true },
    timeout: 1000,
    defaultValue: { healthy: "no" }
  });
};

export const sendAutomationsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "automations",
    ...args
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    ...args
  });
};

export const fetchSegment = (
  subdomain: string,
  segmentId: string,
  options?,
  segmentData?: any
) =>
  sendCoreMessage({
    subdomain,
    action: "fetchSegment",
    data: { segmentId, options, segmentData },
    isRPC: true
  });
