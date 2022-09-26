import { init } from './messageBrokerErkhetHelper';
import { consumeCustomer } from './utils/consumeCustomer';
import {
  consumeInventory,
  consumeInventoryCategory
} from './utils/consumeInventory';
import redis from '@erxes/api-utils/src/redis';

let clientErkhet;

export const sendCommonMessage = async (channel, message): Promise<any> => {
  return clientErkhet.sendMessage(channel, message);
};

export const initBrokerErkhet = async () => {
  clientErkhet = await erkhetBroker();

  const { consumeQueue } = clientErkhet;

  consumeQueue('rpc_queue:erkhet', async ({ subdomain, data }) => {
    const { object, old_code, action } = data;
    const objectData = JSON.parse(object)[0];
    const doc = objectData.fields;
    const kind = objectData.model;

    switch (kind) {
      case 'inventories.inventory':
        await consumeInventory(subdomain, doc, old_code, action);
        break;
      case 'inventories.category':
        await consumeInventoryCategory(subdomain, doc, old_code, action);
        break;
      case 'customers.customer':
        await consumeCustomer(subdomain, doc, old_code, action);
        break;
    }

    return;
  });
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return clientErkhet.sendRPCMessage(channel, message);
};

export const erkhetBroker = async () => {
  const { ERKHET_RABBITMQ_HOST, ERKHET_MESSAGE_BROKER_PREFIX } = process.env;

  return await init({
    RABBITMQ_HOST: ERKHET_RABBITMQ_HOST,
    MESSAGE_BROKER_PREFIX: ERKHET_MESSAGE_BROKER_PREFIX,
    redis
  });
};

export default function() {
  return clientErkhet;
}
