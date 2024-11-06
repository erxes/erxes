import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage as sendCommonMessage
} from "@erxes/api-utils/src/core";

import { integrationBroker } from "./intergration";
import { conversationMessagesBroker } from "./conversationMessages";

export const setupMessageConsumers = async () => {
  integrationBroker();
  conversationMessagesBroker();
};

export const sendCoreMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: "core",
    ...args
  });
};

export const sendInboxMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: "inbox",
    // timeout: 50000,
    ...args
  });
};
