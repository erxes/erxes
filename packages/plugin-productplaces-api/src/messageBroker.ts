import { MessageArgsOmitService, sendMessage } from "@erxes/api-utils/src/core";
import { afterMutationHandlers } from "./afterMutations";
import { consumeQueue } from "@erxes/api-utils/src/messageBroker";

export const setupMessageConsumers = async () => {
  consumeQueue("productplaces:afterMutation", async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
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
