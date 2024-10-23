import { sendMessage } from "@erxes/api-utils/src/core";
import type { MessageArgsOmitService } from "@erxes/api-utils/src/core";
import { generateModels } from "./connectionResolver";
import { consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";
import { getLasthistoryEachAssets } from "./utils";

export const setupMessageConsumers = async () => {
  consumeRPCQueue("assets:assets.find", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Assets.find(data).lean()
    };
  });

  consumeRPCQueue(
    "assets:assets.getKbArticleHistoriesPerAsset",
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: "success",
        data: await getLasthistoryEachAssets(models, data)
      };
    }
  );
};


export const sendSalesMessage = (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "sales",
    ...args
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
