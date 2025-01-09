import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage
} from "@erxes/api-utils/src/core";

export const setupMessageConsumers = async () => {};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "core",
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
