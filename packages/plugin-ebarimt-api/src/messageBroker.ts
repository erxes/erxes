import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { afterMutationHandlers } from './afterMutations';
import { beforeResolverHandlers } from './beforeResolvers';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('ebarimt:afterMutation', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    await afterMutationHandlers(models, subdomain, data);

    return;
  });

  consumeRPCQueue('ebarimt:beforeResolver', async ({ subdomain, data }) => {
    return {
      data: await beforeResolverHandlers(subdomain, data),
      status: 'success'
    };
    return;
  });

  consumeRPCQueue(
    'ebarimt:putresponses.find',
    async ({ subdomain, data: { query, sort } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.PutResponses.find(query)
          .sort(sort || {})
          .lean()
      };
    }
  );

  consumeRPCQueue(
    'ebarimt:putresponses.returnBill',
    async ({ subdomain, data: { contentType, contentId, config } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.PutResponses.returnBill(
          { contentType, contentId },
          config
        )
      };
    }
  );

  consumeRPCQueue(
    'ebarimt:putresponses.createOrUpdate',
    async ({ subdomain, data: { _id, doc } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.PutResponses.updateOne(
          { _id },
          { $set: { ...doc } },
          { upsert: true }
        )
      };
    }
  );

  consumeRPCQueue(
    'ebarimt:putresponses.putHistories',
    async ({ subdomain, data: { contentType, contentId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.PutResponses.putHistories({ contentType, contentId })
      };
    }
  );

  consumeQueue(
    'ebarimt:putresponses.bulkWrite',
    async ({ subdomain, data: { bulkOps } }) => {
      const models = await generateModels(subdomain);

      await models.PutResponses.bulkWrite(bulkOps);

      return {
        status: 'success'
      };
    }
  );
};

export const sendProductsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'products',
    ...args
  });
};

export const sendPosMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'pos',
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

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
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

export const sendNotificationsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'notifications',
    ...args
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
