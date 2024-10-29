import * as dotenv from "dotenv";
import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage as sendCommonMessage
} from "@erxes/api-utils/src/core";

export const sendCoreMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: "core",
    ...args
  });
};

export const sendInboxMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: "inbox",
    timeout: 50000,
    ...args
  });
};
