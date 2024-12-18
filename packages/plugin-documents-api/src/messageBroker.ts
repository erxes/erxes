import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage
} from "@erxes/api-utils/src/core";
import { consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";
import { generateModels } from "./connectionResolver";
import { prepareDoc } from "./util";
const { JSDOM } = require("jsdom");

export const setupMessageConsumers = async () => {
  consumeRPCQueue("documents:findOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Documents.findOne(data).lean()
    };
  });

  consumeRPCQueue("documents:documents.print", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    try {
      const { multipliedResults } = await prepareDoc(
        models,
        subdomain,
        data,
        data.userId
      );
      return {
        status: "success",
        data: multipliedResults // Concatenate the results here
      };
    } catch (err) {
      return {
        status: "error",
        errorMessage: `Error: ${err.message}` // Return error message in 'errorMessage'
      };
    }
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
