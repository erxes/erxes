import { generateModels } from "./connectionResolver";
import { sendMessage } from "@erxes/api-utils/src/core";
import type {
  MessageArgsOmitService,
  MessageArgs
} from "@erxes/api-utils/src/core";

export const setupMessageConsumers = async () => {};

export const sendInboxMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "inbox",
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

export const sendInternalNotesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: "internalnotes",
    ...args
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args
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
    isRPC: true
  });
