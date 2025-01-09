import { sendMessage } from "@erxes/api-utils/src/core";
import { MessageArgs, MessageArgsOmitService } from "@erxes/api-utils/src/core";
import { generateModels } from "./connectionResolver";
import { afterMutationHandlers } from "./afterMutations";
import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";

export const setupMessageConsumers = async () => {
  consumeRPCQueue("grants:requests.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Requests.find(data).lean()
    };
  });

  consumeRPCQueue("grants:requests.findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Requests.findOne(data).lean()
    };
  });

  consumeQueue("grants:afterMutation", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    await afterMutationHandlers(models, subdomain, data);

    return;
  });
};

export const sendCoreMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};

export const sendKbMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: "knowledgebase",
    ...args
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
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
