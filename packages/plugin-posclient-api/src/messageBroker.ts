import * as dotenv from 'dotenv';
import {
  receiveCustomer,
  receiveProduct,
  receiveProductCategory,
  receiveUser,
  receivePosConfig
} from './graphql/utils/syncUtils';
import { Configs } from './models/Configs';
import { Orders } from './models/Orders';
import { debugError } from './debugger';
import { PutResponses } from './models/PutResponses';
import { graphqlPubsub } from './pubsub';
import * as rmqClient from './messageBrokers';
import { OrderItems } from './models/OrderItems';

dotenv.config();

export const initBroker = async () => {
  const { RABBITMQ_HOST, MESSAGE_BROKER_PREFIX } = process.env;

  await rmqClient.init(RABBITMQ_HOST, MESSAGE_BROKER_PREFIX);

  const { consumeQueue, consumeRPCQueue } = rmqClient;

  const config = await Configs.findOne().lean();
  if (!config) {
    throw new Error('not yet message broker');
  }

  const syncId =
    config && config.syncInfo && config.syncInfo.id ? config.syncInfo.id : '';

  try {
    consumeQueue(`pos:crudData_${syncId}`, async data => {
      if (data) {
        switch (data.type) {
          case 'product':
            await receiveProduct(data);
            break;
          case 'productCategory':
            await receiveProductCategory(data);
            break;
          case 'customer':
            await receiveCustomer(data);
            break;
          case 'user':
            await receiveUser(data);
            break;
          case 'pos':
            await receivePosConfig(data);
            break;
          default:
            break;
        }
      }
    });

    consumeQueue(`vrpc_queue:erxes-pos-from-api_${syncId}`, async data => {
      const { responseId, orderId } = data;
      await Configs.updateOne({}, { $set: { 'syncInfo.date': new Date() } });
      await Orders.updateOne({ _id: orderId }, { $set: { synced: true } });
      await PutResponses.updateOne(
        { _id: responseId },
        { $set: { synced: true } }
      );
    });

    consumeQueue(`vrpc_queue:erxes-pos-to-pos_${syncId}`, async data => {
      const { order } = data;

      await Orders.updateOne(
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
        await OrderItems.bulkWrite(bulkOps);
      }

      await graphqlPubsub.publish('ordersOrdered', {
        ordersOrdered: {
          _id: order._id,
          status: order.status
        }
      });
    });

    consumeRPCQueue(`rpc_queue:health_check_${syncId}`, async data => {
      return {
        status: 'success',
        data: { healthy: 'ok' }
      };
    });
  } catch (e) {
    debugError(`Error occurred while receiving message: ${e.message}`);
  }
};

initBroker();

export default function() {
  return rmqClient;
}
