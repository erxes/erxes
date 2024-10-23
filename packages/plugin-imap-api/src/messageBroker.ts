import * as dotenv from "dotenv";
import { sendMessage as sendCommonMessage } from "@erxes/api-utils/src/core";
import { MessageArgs, MessageArgsOmitService } from "@erxes/api-utils/src/core";
import { generateModels } from "./connectionResolver";
import { listenIntegration } from "./utils";
import {
  InterMessage,
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";

dotenv.config();

export const setupMessageConsumers = async () => {
  consumeRPCQueue(
    "imap:createIntegration",
    async ({ subdomain, data: { doc, integrationId } }) => {
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.create({
        inboxId: integrationId,
        healthStatus: "healthy",
        error: "",
        ...JSON.parse(doc.data)
      });

      listenIntegration(subdomain, integration, models);

      await models.Logs.createLog({
        type: "info",
        message: `Started syncing ${integration.user}`
      });

      return {
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "imap:updateIntegration",
    async ({ subdomain, data: { integrationId, doc } }) => {
      const detail = JSON.parse(doc.data);
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        inboxId: integrationId
      });

      if (!integration) {
        return {
          status: "error",
          errorMessage: "Integration not found."
        };
      }

      detail.healthStatus = "healthy";
      detail.error = "";

      await models.Integrations.updateOne(
        { inboxId: integrationId },
        { $set: detail }
      );

      const updatedIntegration = await models.Integrations.findOne({
        inboxId: integrationId
      });

      if (updatedIntegration) {
        listenIntegration(subdomain, integration, models);
      }

      return {
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "imap:removeIntegrations",
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      await models.Messages.deleteMany({
        inboxIntegrationId: integrationId
      });
      await models.Customers.deleteMany({
        inboxIntegrationId: integrationId
      });
      await models.Integrations.deleteMany({
        inboxId: integrationId
      });

      return {
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "imap:api_to_integrations",
    async (args: InterMessage): Promise<any> => {
      const { subdomain, data } = args;
      const models = await generateModels(subdomain);

      const integrationId = data.integrationId;

      const integration = await models.Integrations.findOne({
        inboxId: integrationId
      }).select(["-_id", "-kind", "-erxesApiId", "-inboxId"]);

      if (data.action === "getDetails") {
        return {
          status: "success",
          data: integration
        };
      }
      return {
        status: "success"
      };
    }
  );

  consumeRPCQueue("imap:imapMessage.create", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Messages.createSendMail(data, subdomain, models)
    };
  });

  // /imap/get-status'
  consumeRPCQueue(
    "imap:getStatus",
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        inboxId: integrationId
      });

      let result = {
        status: "healthy"
      } as any;

      if (integration) {
        result = {
          status: integration.healthStatus || "healthy",
          error: integration.error
        };
      }

      return {
        data: result,
        status: "success"
      };
    }
  );

  consumeQueue("imap:listen", async ({ subdomain, data: { _id } }) => {
    const models = await generateModels(subdomain);

    const integration = await models.Integrations.findById(_id);

    if (!integration) {
      console.log(`Queue: imap:listen. Integration not found ${_id}`);
      return;
    }

    listenIntegration(subdomain, integration, models);
  });
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
    ...args
  });
};

export const sendImapMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: "imap",
    ...args
  });
};
