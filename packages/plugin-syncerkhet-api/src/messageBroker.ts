import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { afterMutationHandlers } from './afterMutations';
import { serviceDiscovery } from './configs';
import { consumeCustomer } from './utils/consumeCustomer';
import { consumeInventory, consumeInventoryCategory } from './utils/consumeInventory';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeQueue } = client;

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

  consumeQueue('syncerkhet:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  })
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
  return client.sendMessage(channel, message);
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export default function () {
  return client;
}
