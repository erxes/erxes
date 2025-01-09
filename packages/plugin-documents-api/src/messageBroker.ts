import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage
} from "@erxes/api-utils/src/core";
import { consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";
import { generateModels } from "./connectionResolver";
import { print } from "./utils";

export const setupMessageConsumers = async () => {
  consumeRPCQueue("documents:findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Documents.findOne(data).lean()
    };
  });

  consumeRPCQueue("documents:printDocument", async ({ subdomain, data }) => {
    return {
      status: "success",
      data: await print(subdomain, data)
    };
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    ...args
  });
};

export const sendCoreMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args
  });
};
