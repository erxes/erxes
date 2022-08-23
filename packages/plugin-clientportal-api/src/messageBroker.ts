import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue(
    'clientportal:clientPortals.findOne',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ClientPortals.findOne(data),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'clientportal:clientPortalUsers.findOne',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ClientPortalUsers.findOne(data),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'clientportal:clientPortalUsers.find',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ClientPortalUsers.find(data).lean(),
        status: 'success'
      };
    }
  );
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
