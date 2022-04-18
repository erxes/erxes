import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { afterMutationHandlers } from './afterMutations';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeQueue } = client;

  consumeQueue('syncerkhet:afterMutation', async ({ subdomain, data }) => {
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

export default function () {
  return client;
}
