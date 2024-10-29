import { sendMessage } from "@erxes/api-utils/src/core";
import type {
  MessageArgs,
  MessageArgsOmitService
} from "@erxes/api-utils/src/core";
import { consumeQueue } from "@erxes/api-utils/src/messageBroker";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { sendRPCMessage as sendRPCMessageCore } from "@erxes/api-utils/src/messageBroker";
export const setupMessageConsumers = async () => {};

export const sendRPCMessage = async (message): Promise<any> => {
  return sendRPCMessageCore("rpc_queue:api_to_integrations", message);
};

export const updateConversationMessage = async (data: any) => {
  if (!(await isEnabled("inbox"))) {
    return null;
  }

  return sendRPCMessageCore("inbox:rpc_queue.updateConversationMessage", data);
};

export const getCampaignCustomerInfo = async data => {
  return sendRPCMessageCore("core:rpc_queue.prepareEngageCustomers", data);
};

export const sendInternalNotesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "internalNotes",
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

export const sendEngagesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "engages",
    ...args
  });
};

export const sendInboxMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "inbox",
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

export const sendSegmentsMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "segments",
    ...args
  });
};
