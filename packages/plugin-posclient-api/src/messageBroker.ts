import { generateModels } from './connectionResolver';
import { graphqlPubsub, serviceDiscovery } from './configs';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import {
  receivePosConfig,
  receiveProduct,
  receiveProductCategory,
  receiveUser
} from './graphql/utils/syncUtils';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;
  const models = await generateModels('OS');
  if (!models) {
    throw new Error('not yet message broker, cause: cant connect models');
  }

  const config = await models.Configs.findOne().lean();
  if (!config) {
    throw new Error('not yet message broker');
  }
  const syncId =
    config && config.syncInfo && config.syncInfo.id ? config.syncInfo.id : '';

  consumeQueue(`posclient:crudData_${syncId}`, async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
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
          await receivePosConfig(models, data);
          break;
        default:
          break;
      }
    }
  });

  consumeQueue(
    `posclient:erxes-posclient-from-pos-api_${syncId}`,
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
    `posclient:erxes-posclient-to-pos-api_${syncId}`,
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
    `posclient:health_check_${syncId}`,
    async ({ subdomain, data }) => {
      return {
        status: 'success',
        data: { healthy: 'ok' }
      };
    }
  );
};

export const sendPosMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'pos',
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

export default function() {
  return client;
}
