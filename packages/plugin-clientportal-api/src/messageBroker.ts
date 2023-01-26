import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { afterMutationHandlers } from './afterMutations';

import { serviceDiscovery } from './configs';
import { generateModels, IModels } from './connectionResolver';
import { sendNotification } from './utils';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

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

  consumeRPCQueue(
    'clientportal:clientPortals.count',
    async ({ subdomain, data: { selector } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.ClientPortals.find(selector).count(),
        status: 'success'
      };
    }
  );

  /**
   * Send notification to client portal
   * @param {Object} data
   * @param {String[]} data.receivers // client portal user ids
   * @param {String} data.title // notification title
   * @param {String} data.content // notification content
   * @param {String} data.notifType // notification type could be "system" or "engage"
   * @param {String} data.link // notification link
   * @param {Object} data.createdUser // user who created this notification
   * @param {Boolean} data.isMobile // is mobile notification
   */
  consumeQueue('clientportal:sendNotification', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    await sendNotification(models, subdomain, data);
  });

  consumeQueue('clientportal:afterMutation', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return afterMutationHandlers(models, subdomain, data);
  });
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

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
