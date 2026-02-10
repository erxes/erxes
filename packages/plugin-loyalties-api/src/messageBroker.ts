import type {
  MessageArgs,
  MessageArgsOmitService,
} from "@erxes/api-utils/src/core";
import { sendMessage } from "@erxes/api-utils/src/core";
import { generateModels } from "./connectionResolver";

import {
  consumeQueue,
  consumeRPCQueue,
} from "@erxes/api-utils/src/messageBroker";
import {
  checkVouchersSale,
  confirmVoucherSale,
  doScoreCampaign,
  handleLoyaltyOwnerChange,
  handleLoyaltyReward,
  handleScore,
  refundLoyaltyScore,
} from "./utils";

export const setupMessageConsumers = async () => {
  consumeRPCQueue(
    "loyalties:voucherCampaigns.find",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.VoucherCampaigns.find(data).lean(),
        status: "success",
      };
    }
  );

  consumeRPCQueue("loyalties:checkLoyalties", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { ownerType, ownerId, products, discountInfo } = data;

    return {
      data: await checkVouchersSale(
        models,
        subdomain,
        ownerType,
        ownerId,
        products,
        discountInfo
      ),
      status: "success",
    };
  });

  consumeQueue("loyalties:handleLoyaltyReward", async ({ subdomain }) => {
    return {
      data: await handleLoyaltyReward({ subdomain }),
      status: "success",
    };
  });

  consumeQueue("loyalties:confirmLoyalties", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { checkInfo, extraInfo } = data;

    return {
      data: await confirmVoucherSale(models, subdomain, checkInfo, extraInfo),
      status: "success",
    };
  });

  consumeQueue(
    "loyalties:automations.receiveSetPropertyForwardTo",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const target = data.target;

      const response = await models.ScoreLogs.create({
        ownerId: target._id,
        ownerType: data.collectionType,
        changeScore: data.setDoc[Object.keys(data.setDoc)[0]],
        createdAt: new Date(),
        description: "Via automation",
      });

      return {
        data: response,
        status: "success",
      };
    }
  );

  consumeRPCQueue(
    "loyalties:checkScoreAviableSubtract",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ScoreCampaigns.checkScoreAviableSubtract(data),
        status: "success",
      };
    }
  );

  consumeRPCQueue(
    "loyalties:scoreCampaign.findOne",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ScoreCampaigns.findOne(data),
        status: "success",
      };
    }
  );

  consumeRPCQueue("loyalties:checkCoupon", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Coupons.checkCoupon(data),
      status: "success",
    };
  });

  consumeRPCQueue("loyalties:doScoreCampaign", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await doScoreCampaign(models, data),
      status: "success",
    };
  });

  consumeRPCQueue("loyalties:refundLoyaltyScore", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await refundLoyaltyScore(models, data),
      status: "success",
    };
  });

  consumeQueue("loyalties:updateScore", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    await handleScore(models, data);

    return {
      data: null,
      status: "success",
    };
  });

  consumeQueue(
    "loyalties:changeCustomer",
    async ({ subdomain, data: { customerId, customerIds } }) => {
      const models = await generateModels(subdomain);

      await handleLoyaltyOwnerChange(subdomain, models, customerId, customerIds);
    }
  );
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args,
  });
};

export const sendNotificationsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "notifications",
    ...args,
  });
};

export const sendClientPortalMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "clientportal",
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};

export const sendNotification = (subdomain: string, data) => {
  return sendNotificationsMessage({ subdomain, action: "send", data });
};
