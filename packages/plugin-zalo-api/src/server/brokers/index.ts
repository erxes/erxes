import {
  MessageArgs,
  sendMessage as sendCommonMessage,
} from '@erxes/api-utils/src/core';

import { integrationBroker } from './intergration';
import { conversationMessagesBroker } from './conversationMessages';

let client;

export const initBroker = async (cl) => {
  client = cl;

  integrationBroker(cl);
  conversationMessagesBroker(cl);
};

export default function () {
  return client;
}

export const sendContactsMessage = (args: MessageArgs) => {
  return sendCommonMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendInboxMessage = (args: MessageArgs) => {
  return sendCommonMessage({
    serviceName: 'inbox',
    // timeout: 50000,
    ...args,
  });
};
