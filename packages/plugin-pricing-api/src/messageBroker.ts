import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { serviceDiscovery } from './configs';
import { checkPricing } from './utils';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue('pricing:checkPricing', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { totalAmount, departmentId, branchId, products } = data;
    return {
      data:
        (await checkPricing(
          models,
          subdomain,
          totalAmount,
          departmentId,
          branchId,
          products
        )) || {},
      status: 'success'
    };
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
