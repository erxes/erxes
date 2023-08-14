import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue('inventories:remainders', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Remainders.getRemainders(subdomain, data),
      status: 'success'
    };
  });

  consumeRPCQueue('inventories:remainderCount', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Remainders.getRemainderCount(subdomain, data),
      status: 'success'
    };
  });

  consumeQueue(
    'inventories:remainders.updateMany',
    async ({ subdomain, data: { branchId, departmentId, productsData } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Remainders.updateRemainders(
          subdomain,
          branchId,
          departmentId,
          productsData
        )
      };
    }
  );

  consumeRPCQueue(
    'inventories:reserveRemainders.find',
    async ({ subdomain, data: { productIds, branchId, departmentId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.ReserveRems.find({
          branchId,
          departmentId,
          productId: { $in: productIds }
        }).lean()
      };
    }
  );

  consumeRPCQueue('inventories:transactionAdd', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.Transactions.createTransaction(data),
      status: 'success'
    };
  });
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

export const sendPosMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'products',
    ...args
  });
};

export const sendProcessesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'processes',
    ...args
  });
};

export default function() {
  return client;
}
