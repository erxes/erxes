import { MessageArgsOmitService, sendMessage } from "@erxes/api-utils/src/core";
import { afterMutationHandlers } from "./afterMutations";
import { consumeQueue, consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";
import { beforeResolverHandlers } from "./beforeResolvers";
import { generateModels } from "./connectionResolver";

export const setupMessageConsumers = async () => {
  consumeQueue("productplaces:afterMutation", async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeRPCQueue("productplaces:beforeResolver", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      data: await beforeResolverHandlers(models, subdomain, data),
      status: "success"
    };
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

export const sendPricingMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "pricing",
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
