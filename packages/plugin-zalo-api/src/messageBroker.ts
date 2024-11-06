import * as dotenv from "dotenv";
import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage as sendCommonMessage
} from "@erxes/api-utils/src/core";

// import { Customers, Integrations, Messages } from './models';
import { generateModels } from "./connectionResolver";
import {
  zaloCreateIntegration,
  removeIntegration
  // repairIntegrations
} from "./helpers";
import { RPResult, consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";

dotenv.config();

export const setupMessageConsumers = async () => {
  consumeRPCQueue(
    "zalo:createIntegration",
    async ({ subdomain, data: { doc, kind } }): Promise<RPResult> => {
      const models = await generateModels(subdomain);

      if (kind === "zalo") {
        return zaloCreateIntegration(models, doc);
      }

      return {
        status: "error",
        errorMessage: "Wrong kind"
      };
    }
    // async ({ data: { doc, integrationId } }) => {

    //   await Integrations.create({
    //     inboxId: integrationId,
    //     ...(doc || {})
    //   });

    //   return {
    //     status: 'success'
    //   };
    // }
  );

  consumeRPCQueue(
    "zalo:removeIntegration",
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);
      await removeIntegration(models, integrationId);
      // await Messages.remove({ inboxIntegrationId: integrationId });
      // await Customers.remove({ inboxIntegrationId: integrationId });
      // await Integrations.remove({ inboxId: integrationId });

      return {
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "zalo:conversationMessages.find",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: /* await models.ConversationMessages.find(data).lean() */ []
      };
    }
  );
};

export const sendCoreMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: "core",
    ...args
  });
};

export const sendInboxMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: "inbox",
    timeout: 50000,
    ...args
  });
};
