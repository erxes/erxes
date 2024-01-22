import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage as sendCommonMessage,
} from '@erxes/api-utils/src/core';

import { integrationBroker } from './intergration';
import { conversationMessagesBroker } from './conversationMessages';

export const initBroker = async () => {
  integrationBroker();
  conversationMessagesBroker();
};

export const sendContactsMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendInboxMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: 'inbox',
    // timeout: 50000,
    ...args,
  });
};
