import * as dotenv from 'dotenv';
import {
  receiveCustomer,
  receiveProduct,
  receiveProductCategory,
  receiveUser,
  receivePosConfig
} from './graphql/utils/syncUtils';
import { Orders } from './models/Orders';
import { debugError } from './debugger';
import { PutResponses } from './models/PutResponses';
import { graphqlPubsub } from './graphql/pubsub';
import { OrderItems } from './models/OrderItems';
import { sendToWebhook as sendWebhook } from '@erxes/api-utils/src';

dotenv.config();

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  try {
    consumeQueue(`posclient:crudData_${''}`, async data => {
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

    consumeQueue(`posclient:erxes-posclient-from-pos-api_${''}`, async data => {
      const { responseId, orderId } = data;

      await Orders.updateOne({ _id: orderId }, { $set: { synced: true } });
      await PutResponses.updateOne(
        { _id: responseId },
        { $set: { synced: true } }
      );
    });

    consumeQueue(`posclient:erxes-posclient-to-pos-api_${''}`, async data => {
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

    consumeRPCQueue(`posclient:health_check_${''}`, async data => {
      return {
        status: 'success',
        data: { healthy: 'ok' }
      };
    });
  } catch (e) {
    debugError(`Error occurred while receiving message: ${e.message}`);
  }
};

export const sendToWebhook = ({ subdomain, data }) => {
  return sendWebhook(client, { subdomain, data });
};

export default function() {
  return client;
}
