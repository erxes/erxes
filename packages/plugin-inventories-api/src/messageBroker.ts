import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";
import { generateModels } from "./connectionResolver";
import { sendMessage } from "@erxes/api-utils/src/core";
import type {
  MessageArgs,
  MessageArgsOmitService
} from "@erxes/api-utils/src/core";

export const setupMessageConsumers = async () => {
  consumeRPCQueue("inventories:remainders", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Remainders.getRemainders(subdomain, data),
      status: "success"
    };
  });

  consumeRPCQueue("inventories:remainderCount", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Remainders.getRemainderCount(subdomain, data),
      status: "success"
    };
  });

  consumeQueue(
    "inventories:remainders.updateMany",
    async ({ subdomain, data: { branchId, departmentId, productsData } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.Remainders.updateRemainders(
          subdomain,
          branchId,
          departmentId,
          productsData
        )
      };
    }
  );

  consumeRPCQueue(
    "inventories:reserveRemainders.find",
    async ({ subdomain, data: { productIds, branchId, departmentId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.ReserveRems.find({
          branchId,
          departmentId,
          productId: { $in: productIds }
        }).lean()
      };
    }
  );

  consumeRPCQueue("inventories:transactionAdd", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Transactions.createTransaction(data),
      status: "success"
    };
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
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

export const sendPosMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "pos",
    ...args
  });
};

export const sendProcessesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "processes",
    ...args
  });
};
