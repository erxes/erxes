import { generateModels } from "./connectionResolver";

import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage
} from "@erxes/api-utils/src/core";
import {
  importProducts,
  importSlots,
  preImportProducts,
  receivePosConfig,
  receiveProduct,
  receiveProductCategory,
  receiveUser
} from "./graphql/utils/syncUtils";
import {
  consumeQueue,
  consumeRPCQueue,
  sendRPCMessageMq
} from "@erxes/api-utils/src/messageBroker";
import { updateMobileAmount } from "./utils";
import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";
import { ordersAdd } from "./graphql/resolvers/mutations/orders";

export const setupMessageConsumers = async () => {
  const { SKIP_REDIS } = process.env;

  let channelToken = "";
  if (SKIP_REDIS) {
    const models = await generateModels("OS");

    if (!models) {
      throw new Error("not yet message broker, cause: cant connect models");
    }

    const config = await models.Configs.findOne().lean();
    if (!config || !config.token) {
      return;
    }

    channelToken = `_${config.token}`;
  }

  consumeRPCQueue(
    `posclient:configs.manage${channelToken}`,
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await receivePosConfig(subdomain, models, data)
      };
    }
  );

  consumeRPCQueue(
    `posclient:configs.remove${channelToken}`,
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { posId, posToken } = data;

      const config = await models.Configs.findOne({ token: posToken }).lean();
      if (!config) {
        throw new Error("not found config from posclient");
      }

      await models.Configs.updateOne(
        { token: posToken },
        { $set: { status: "deleted" } }
      );
      return {
        status: "success",
        data: {}
      };
    }
  );

  consumeQueue(
    `posclient:crudData${channelToken}`,
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { token } = data;

      if (data) {
        switch (data.type) {
          case "product":
            await receiveProduct(models, data);
            break;
          case "productCategory":
            await receiveProductCategory(models, data);
            break;
          case "user":
            await receiveUser(models, data);
            break;
          case "productGroups":
            const { productGroups = [] } = data;
            await preImportProducts(models, token, productGroups);
            await importProducts(subdomain, models, token, productGroups);
            break;
          case "slots":
            const { slots = [] } = data;
            await importSlots(models, slots, token);
            break;
          default:
            break;
        }
      }
    }
  );

  consumeQueue(
    `posclient:updateSynced${channelToken}`,
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { responseIds, orderId, convertDealId } = data;

      await models.Orders.updateOne(
        { _id: orderId },
        { $set: { synced: true, convertDealId } }
      );
      await models.PutResponses.updateMany(
        { _id: { $in: responseIds } },
        { $set: { synced: true } }
      );
    }
  );

  consumeQueue(
    `posclient:erxes-posclient-to-pos-api${channelToken}`,
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { order } = data;

      await models.Orders.updateOne(
        { _id: order._id },
        { $set: { ...order, modifiedAt: new Date() } },
        { upsert: true }
      );

      const bulkOps: any[] = [];

      for (const item of order.items) {
        bulkOps.push({
          updateOne: {
            filter: { _id: item._id },
            update: {
              $set: {
                ...item,
                orderId: order._id
              }
            },
            upsert: true
          }
        });
      }
      if (bulkOps.length) {
        await models.OrderItems.bulkWrite(bulkOps);
      }

      await graphqlPubsub.publish("ordersOrdered", {
        ordersOrdered: {
          ...(await models.Orders.findOne({ _id: order._id }).lean()),
          _id: order._id,
          status: order.status,
          customerId: order.customerId,
          customerType: order.customerType
        }
      });
    }
  );

  consumeQueue(
    `posclient:erxes-posclient-to-pos-api-remove${channelToken}`,
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { order } = data;

      await models.Orders.deleteOne({
        _id: order._id,
        posToken: order.posToken,
        subToken: order.subToken
      });
    }
  );

  consumeQueue(
    `posclient:paymentCallbackClient${channelToken}`,
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { status } = data;
      if (status !== "paid") {
        return;
      }

      await updateMobileAmount(subdomain, models, [data]);
    }
  );

  consumeRPCQueue(
    `posclient:health_check${channelToken}`,
    async ({ subdomain, data }) => {
      if (channelToken) {
        return {
          status: "success",
          data: { healthy: "ok" }
        };
      }

      const models = await generateModels(subdomain);
      const conf = await models.Configs.findOne({ token: data.token });

      if (!conf) {
        return {
          status: "success",
          data: { healthy: "no" }
        };
      }

      return {
        status: "success",
        data: { healthy: "ok" }
      };
    }
  );

  consumeRPCQueue(
    `posclient:covers.remove${channelToken}`,
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const { cover } = data;
      await models.Covers.updateOne(
        { _id: cover._id },
        { $set: { status: "reconf" } }
      );
      return {
        status: "success",
        data: await models.Covers.findOne({ _id: cover._id })
      };
    }
  );

  consumeRPCQueue(
    `posclient:createOrder${channelToken}`,
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const { order = {} } = data || {};

      const { posToken } = order;

      const config = await models.Configs.findOne({ token: posToken });

      if (!config) {
        return {
          status: "error",
          errorMessage: "Cannot find pos user or config"
        };
      }

      return {
        status: "success",
        data: await ordersAdd(order, {
          subdomain,
          models,
          config
        })
      };
    }
  );
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    ...args
  });
};

export const sendMessageWrapper = async (
  serviceName: string,
  args: MessageArgsOmitService
): Promise<any> => {
  const { SKIP_REDIS } = process.env;

  if (SKIP_REDIS) {
    const { action, isRPC, defaultValue, subdomain } = args;
    try {
      // check connected gateway on server and check some plugins isAvailable
      if (isRPC) {
        const longTask: Promise<boolean> = sendRPCMessageMq(
          'core:isServiceEnabled',
          {
            subdomain,
            data: serviceName,
            thirdService: true
          }
        );

        const timeout = new Promise<boolean>(resolve =>
          setTimeout(() => resolve(false), 1000)
        );

        const response = await Promise.race([longTask, timeout]);

        args.isMQ = true;

        if (!response) {
          return defaultValue;
        }
      }
      try {
        return await sendMessage({
          serviceName: '',
          ...args,
          data: { ...(args.data || {}), thirdService: true },
          action: `${serviceName}:${action}`
        });
      } catch (e) {
        return defaultValue
      }
    } catch (e) {
      return defaultValue;
    }
  }

  return sendMessage({
    serviceName,
    ...args
  });
};

export const sendPosMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessageWrapper("pos", args);
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessageWrapper("core", args);
};

export const sendInventoriesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessageWrapper("inventories", args);
};

export const sendSalesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessageWrapper("sales", args);
};

export const sendInboxMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessageWrapper("inbox", args);
};

export const sendLoyaltiesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessageWrapper("loyalties", args);
};

export const sendPricingMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessageWrapper("pricing", args);
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
