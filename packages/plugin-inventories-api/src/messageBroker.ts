import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('inventories:remainders', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Remainders.getRemainders(subdomain, data),
      status: 'success'
    };
  });

  consumeRPCQueue('inventories:remainder', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Remainders.getRemainder(subdomain, data),
      status: 'success'
    };
  });

  // consumeRPCQueue('inventories:transaction', async({ subdomain, data }) => {
  //   const models = await generateModels(subdomain);

  //   return {
  //     data: await models.Transactions.createTransaction(subdomain),
  //     status: 'success'
  //   }
  // })
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

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
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

export default function() {
  return client;
}
