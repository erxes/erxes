// import { generateModels } from './connectionResolver';
import { generateModels } from "./db/models";
import { sendMessage } from "@erxes/api-utils/src/core";
import type {
  MessageArgs,
  MessageArgsOmitService
} from "@erxes/api-utils/src/core";

export const setupMessageConsumers = async () => {};

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

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args
  });
};

export const fetchSegment = (subdomain: string, segmentId: string, options?) =>
  sendSegmentsMessage({
    subdomain,
    action: "fetchSegment",
    data: { segmentId, options },
    isRPC: true
  });

export const sendClientPortalMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: "clientportal",
    ...args
  });
};
