import { generateModels } from "./connectionResolver";
import { sendMessage } from "@erxes/api-utils/src/core";
import type {
  MessageArgs,
  MessageArgsOmitService
} from "@erxes/api-utils/src/core";

import { afterMutationHandlers } from "./afterMutations";
import { beforeResolverHandlers } from "./beforeResolvers";
import { getCompanyInfo, getConfig } from "./utils";
import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";

export const setupMessageConsumers = async () => {
  consumeQueue("ebarimt:afterMutation", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    await afterMutationHandlers(models, subdomain, data);

    return;
  });

  consumeRPCQueue("ebarimt:beforeResolver", async ({ subdomain, data }) => {
    return {
      data: await beforeResolverHandlers(subdomain, data),
      status: "success"
    };
  });

  consumeRPCQueue(
    "ebarimt:putresponses.find",
    async ({ subdomain, data: { query, sort } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.PutResponses.find(query)
          .sort(sort || {})
          .lean()
      };
    }
  );

  consumeRPCQueue(
    "ebarimt:putresponses.putDatas",
    async ({
      subdomain,
      data: { contentType, contentId, orderInfo, config }
    }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.PutResponses.putData(
          {
            ...orderInfo,
            contentType,
            contentId
          },
          { ...(await getConfig(subdomain, "EBARIMT", {})), ...config }
        )
      };
    }
  );

  consumeRPCQueue(
    "ebarimt:putresponses.returnBill",
    async ({ subdomain, data: { contentType, contentId, number, config } }) => {
      const models = await generateModels(subdomain);
      const mainConfig = {
        ...(await getConfig(subdomain, "EBARIMT", {})),
        ...config
      };

      return {
        status: "success",
        data: await models.PutResponses.returnBill(
          { contentType, contentId, number },
          mainConfig
        )
      };
    }
  );

  consumeRPCQueue(
    "ebarimt:putresponses.createOrUpdate",
    async ({ subdomain, data: { _id, doc } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.PutResponses.updateOne(
          { _id },
          { $set: { ...doc } },
          { upsert: true }
        )
      };
    }
  );

  consumeRPCQueue(
    "ebarimt:putresponses.putHistory",
    async ({ subdomain, data: { contentType, contentId, taxType } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.PutResponses.putHistory({
          contentType,
          contentId
        })
      };
    }
  );

  consumeRPCQueue(
    "ebarimt:putresponses.putHistories",
    async ({ subdomain, data: { contentType, contentId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await models.PutResponses.putHistories({
          contentType,
          contentId
        })
      };
    }
  );

  consumeQueue(
    "ebarimt:putresponses.bulkWrite",
    async ({ subdomain, data: { bulkOps } }) => {
      const models = await generateModels(subdomain);

      await models.PutResponses.bulkWrite(bulkOps);

      return {
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "ebarimt:putresponses.getCompany",
    async ({ subdomain, data: { companyRD } }) => {
      const config = (await getConfig(subdomain, "EBARIMT", {})) || {};
      const response = await getCompanyInfo({
        checkTaxpayerUrl: config.checkTaxpayerUrl,
        no: companyRD
      });
      return {
        status: "success",
        data: response.result?.data
      };
    }
  );

  consumeRPCQueue("ebarimt:productRules.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.ProductRules.find(data).lean()
    };
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

export const sendLoansMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "loans",
    ...args
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

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};

export const sendNotificationsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "notifications",
    ...args
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args
  });
};
