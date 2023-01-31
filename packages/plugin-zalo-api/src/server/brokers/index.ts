import {
  ISendMessageArgs,
  sendMessage as sendCommonMessage
} from '@erxes/api-utils/src/core';
import { serviceDiscovery } from '../../configs';
import { integrationBroker } from './intergration';
import { conversationMessagesBroker } from './conversationMessages';

let client;

export const initBroker = async cl => {
  client = cl;

  integrationBroker(cl);
  conversationMessagesBroker(cl);
};

export default function() {
  return client;
}

export const sendContactsMessage = (args: ISendMessageArgs) => {
  return sendCommonMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendInboxMessage = (args: ISendMessageArgs) => {
  return sendCommonMessage({
    client,
    serviceDiscovery,
    serviceName: 'inbox',
    // timeout: 50000,
    ...args
  });
};
