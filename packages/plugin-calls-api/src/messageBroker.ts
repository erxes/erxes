import { sendMessage } from "@erxes/api-utils/src/core";
import type {
  MessageArgs,
  MessageArgsOmitService
} from "@erxes/api-utils/src/core";
import { generateToken } from "./utils";
import { generateModels } from "./connectionResolver";
import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";
import type {
  InterMessage,
  RPResult
} from "@erxes/api-utils/src/messageBroker";
import { removeCustomers } from "./helpers";

export const setupMessageConsumers = async () => {
  consumeRPCQueue(
    "calls:createIntegration",
    async (args: InterMessage): Promise<any> => {
      const { subdomain, data } = args;
      const { integrationId, doc } = data;
      const models = generateModels(subdomain);
      const docData = JSON.parse(doc.data);

      const token = await generateToken(integrationId);

      await (
        await models
      ).Integrations.create({
        inboxId: integrationId,
        token,
        ...docData
      });

      return {
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "calls:api_to_integrations",
    async (args: InterMessage): Promise<RPResult> => {
      const { subdomain, data } = args;
      const { integrationId, action } = data;

      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        inboxId: integrationId
      });

      if (!integration) {
        return {
          status: "error",
          errorMessage: "integration not found."
        };
      }

      if (action === "getDetails") {
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

  consumeRPCQueue(
    "calls:updateIntegration",
    async ({ subdomain, data: { integrationId, doc } }) => {
      const details = JSON.parse(doc.data);
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

      let queues;
      if (typeof details?.queues === "string") {
        queues = details.queues.split(",");
      } else {
        queues = [];
      }

      await models.Integrations.updateOne(
        { inboxId: integrationId },
        { $set: { ...details, queues: queues } }
      );

      const updatedIntegration = await models.Integrations.findOne({
        inboxId: integrationId
      });

      if (updatedIntegration) {
        return {
          status: "success"
        };
      } else {
        return {
          status: "error",
          errorMessage: "Integration not found."
        };
      }
    }
  );

  consumeRPCQueue(
    "calls:removeIntegrations",
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      await models.Integrations.deleteOne({ inboxId: integrationId });
      await models.Customers.deleteMany({ inboxIntegrationId: integrationId });

      return {
        status: "success"
      };
    }
  );

  consumeRPCQueue(
    "calls:integrationDetail",
    async (args: InterMessage): Promise<any> => {
      const { subdomain, data } = args;
      const { inboxId } = data;

      const models = await generateModels(subdomain);

      const callIntegration = await models.Integrations.findOne(
        { inboxId },
        "token"
      );

      return {
        status: "success",
        data: { token: callIntegration?.token }
      };
    }
  );
  consumeQueue("calls:notification", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { type } = data;

    switch (type) {
      case "removeCustomers":
        await removeCustomers(models, data);
        break;

      default:
        break;
    }
  });
  consumeRPCQueue(
    "calls:getCallHistory",
    async (args: InterMessage): Promise<any> => {
      try {
        const { subdomain, data } = args;
        const models = await generateModels(subdomain);
        const { erxesApiConversationId } = data;

        if (!erxesApiConversationId) {
          return {
            status: "error",
            errorMessage: "Conversation id not found."
          };
        }

        const history = await models.CallHistory.findOne({
          conversationId: erxesApiConversationId
        });
        return {
          status: "success",
          data: history
        };
      } catch (error) {
        return {
          status: "error",
          errorMessage: "Error processing call history:" + error
        };
      }
    }
  );
};

export const sendCommonMessage = async (args: MessageArgs) => {
  return sendMessage({
    ...args
  });
};

export const sendInboxMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: "inbox",
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
