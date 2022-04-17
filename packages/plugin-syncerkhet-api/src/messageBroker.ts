import { init } from '@erxes/api-utils/src/messageBroker';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { afterMutationHandlers } from './afterMutations';
import { serviceDiscovery } from './configs';
import { consumeCustomer } from './utils/consumeCustomer';
import { consumeInventory, consumeInventoryCategory } from './utils/consumeInventory';
import redis from '@erxes/api-utils/src/redis';

let client;
let clientErkhet;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeQueue } = client;
  console.log('zzzzzzzzzzzzzzz')

  consumeQueue('syncerkhet:afterMutation', async ({ subdomain, data }) => {
    console.log('clienttttttttttttt')
    await afterMutationHandlers(subdomain, data);
    return;
  });
};

export const sendProductsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'products', ...args });
};

export const sendContactsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'contacts', ...args });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'core', ...args });
};

export const sendNotificationsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'notifications', ...args });
};

export const sendCommonMessage = async (channel, message): Promise<any> => {
  return clientErkhet.sendMessage(channel, message);
};

export const initBrokerErkhet = async () => {
  clientErkhet = await erkhetBroker();

  const { consumeQueue } = clientErkhet;
  console.log('ddddddddddddddddddddd')

  consumeQueue('rpc_queue:erkhet', async ({ subdomain, data }) => {
    console.log('client erkhetttttttttttt')
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

}

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return clientErkhet.sendRPCMessage(channel, message);
};

export const erkhetBroker = async () => {
  const { ERKHET_RABBITMQ_HOST, ERKHET_MESSAGE_BROKER_PREFIX } = process.env;
  const messageBrokerClient = await init({
    RABBITMQ_HOST: ERKHET_RABBITMQ_HOST,
    MESSAGE_BROKER_PREFIX: ERKHET_MESSAGE_BROKER_PREFIX,
    redis
  });

  return messageBrokerClient;
}

export default function () {
  return client;
}
