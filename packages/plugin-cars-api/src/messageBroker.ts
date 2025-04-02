import type {
  MessageArgs,
  MessageArgsOmitService,
} from "@erxes/api-utils/src/core";
import { sendMessage } from "@erxes/api-utils/src/core";
import { consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";
import { generateModels } from "./connectionResolver";

export const setupMessageConsumers = async () => {
  consumeRPCQueue("cars:cars.find", async ({ subdomain, data: { query } }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.Cars.find(query).lean(),
    };
  });
};

export const sendInboxMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "inbox",
    ...args,
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "core",
    ...args,
  });
};

export const sendInternalNotesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "internalnotes",
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};

export const fetchSegment = (
  subdomain: string,
  segmentId: string,
  options?,
  segmentData?: any
) =>
  sendCoreMessage({
    subdomain,
    action: "fetchSegment",
    data: { segmentId, options, segmentData },
    isRPC: true,
  });
