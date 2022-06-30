import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { debugBase } from '@erxes/api-utils/src/debuggers';
import { rf } from './utils/receiveFlow';

let client;

export const initBroker = async cl => {
  client = cl;
  const { consumeQueue, consumeRPCQueue } = cl;
  consumeQueue('processess:createWorks', async ({ subdomain, data }) => {
    debugBase(`Receiving queue data: ${JSON.stringify(data)}`);

    const models = await generateModels(subdomain);
    await rf(models, subdomain, { data });
    return { status: 'success' };
  });

  consumeRPCQueue(
    'processes:findJobProductIds',
    async ({ subdomain, data: { _ids } }) => {
      const models = await generateModels(subdomain);

      const needProductIds = await await models.JobRefers.find({
        'needProducts.productId': { $in: _ids }
      }).distinct('productsData.productId');
      const resProductIds = await await models.JobRefers.find({
        'resultProducts.productId': { $in: _ids }
      }).distinct('productsData.productId');

      return { data: [...needProductIds, ...resProductIds], status: 'success' };
    }
  );
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

export const sendSalesplansMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'salesplans',
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

export default function() {
  return client;
}
