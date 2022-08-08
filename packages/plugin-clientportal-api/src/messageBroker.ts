import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { debugBase } from '@erxes/api-utils/src/debuggers';

import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';

let client;

export const initBroker = async cl => {
  client = cl;

  // const { consumeQueue } = cl;

  // consumeQueue('clientportalsss:fieldssss.getListssss', async ({ subdomain, data }) => {
  //   debugBase(`Receiving queue data: ${JSON.stringify(data)}`);

  //   return [];
  // });
};

export const sendCoreMessage = async (args: ISendMessageArgs) => {
  return sendMessage({
    serviceDiscovery,
    client,
    serviceName: 'core',
    ...args
  });
};

export const sendContactsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendCardsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'cards',
    ...args
  });
};

export const sendKbMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'knowledgebase',
    ...args
  });
};

export default function() {
  return client;
}
