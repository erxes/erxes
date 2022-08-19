import { generateModels } from './connectionResolver';
import { graphqlPubsub, serviceDiscovery } from './configs';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import {
  importProducts,
  importSlots,
  preImportProducts,
  receivePosConfig,
  receiveProduct,
  receiveProductCategory,
  receiveUser
} from './graphql/utils/syncUtils';

let client;

export const initBroker = async cl => {
  const { SKIP_REDIS } = process.env;

  let channelToken = '';
  if (SKIP_REDIS) {
    const models = await generateModels('OS');

    if (!models) {
      throw new Error('not yet message broker, cause: cant connect models');
    }

    const config = await models.Configs.findOne().lean();
    if (!config || !config.token) {
      return;
    }

    channelToken = `_${config.token}`;
  }

  client = cl;
  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue(
    `posclient:crudData${channelToken}`,
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { token } = data;

      if (data) {
        switch (data.type) {
          case 'product':
            await receiveProduct(models, data);
            break;
          case 'productCategory':
            await receiveProductCategory(models, data);
            break;
          case 'user':
            await receiveUser(models, data);
            break;
          case 'pos':
            await receivePosConfig(subdomain, models, data);
            break;
          case 'productGroups':
            const { productGroups = [] } = data;
            await preImportProducts(models, token, productGroups);
            await importProducts(subdomain, models, token, productGroups);
            break;
          case 'slots':
            const { slots = [] } = data;
            await importSlots(models, slots);
            break;
          default:
            break;
        }
      }
    }
  );

  consumeQueue(
    `posclient:updateSynced${channelToken}`,
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { responseId, orderId } = data;

      await models.Orders.updateOne(
        { _id: orderId },
        { $set: { synced: true } }
      );
      await models.PutResponses.updateOne(
        { _id: responseId },
        { $set: { synced: true } }
      );
    }
  );

  consumeQueue(
    `posclient:erxes-posclient-to-pos-api${channelToken}`,
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);
      const { order } = data;

      await models.Orders.updateOne(
        { _id: order._id },
        { $set: { ...order } },
        { upsert: true }
      );

      const bulkOps: any[] = [];

      for (const item of order.items) {
        bulkOps.push({
          updateOne: {
            filter: { _id: item._id },
            update: {
              $set: {
                ...item,
                orderId: order._id
              }
            },
            upsert: true
          }
        });
      }
      if (bulkOps.length) {
        await models.OrderItems.bulkWrite(bulkOps);
      }

      await graphqlPubsub.publish('ordersOrdered', {
        ordersOrdered: {
          _id: order._id,
          status: order.status,
          customerId: order.customerId
        }
      });
    }
  );

  consumeRPCQueue(
    `posclient:health_check${channelToken}`,
    async ({ subdomain, data }) => {
      if (channelToken) {
        return {
          status: 'success',
          data: { healthy: 'ok' }
        };
      }

      const models = await generateModels(subdomain);
      const conf = await models.Configs.findOne({ token: data.token });

      if (!conf) {
        return {
          status: 'success',
          data: { healthy: 'no' }
        };
      }

      return {
        status: 'success',
        data: { healthy: 'ok' }
      };
    }
  );
};

const sendMessageWrapper = async (
  serviceName: string,
  args: ISendMessageArgs
): Promise<any> => {
  const { SKIP_REDIS } = process.env;
  if (SKIP_REDIS) {
    const { action } = args;
    return sendMessage({
      client,
      serviceDiscovery,
      serviceName: '',
      ...args,
      action: `${serviceName}:${action}`
    });
  }

  return sendMessage({
    client,
    serviceDiscovery,
    serviceName,
    ...args
  });
};

export const sendPosMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessageWrapper('pos', args);
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessageWrapper('core', args);
};

export const sendContactsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessageWrapper('contacts', args);
};

export const sendLoyaltiesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessageWrapper('loyalties', args);
};

export default function() {
  return client;
}
