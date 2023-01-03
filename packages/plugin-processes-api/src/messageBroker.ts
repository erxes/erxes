import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { beforeResolverHandlers } from './beforeResolvers';
import {
  consumeSalesPlans,
  removeFromSalesPlans
} from './utils/consumeSalesPlans';

let client;

export const initBroker = async cl => {
  client = cl;
  const { consumeQueue, consumeRPCQueue } = cl;
  consumeQueue(
    'processes:createWorks',
    async ({ subdomain, data: { dayPlans, date, branchId, departmentId } }) => {
      // if (!(branchId && departmentId && date && new Date(date) > new Date())) {
      if (!(branchId && departmentId && date)) {
        throw new Error('not valid data');
      }

      if (!dayPlans || !dayPlans.length) {
        throw new Error('not valid data');
      }

      await sendSalesplansMessage({
        subdomain,
        action: 'dayPlans.updateStatus',
        data: { _ids: dayPlans.map(d => d._id), status: 'pending' }
      });

      const models = await generateModels(subdomain);

      const qb = new consumeSalesPlans(models, subdomain, {
        dayPlans,
        date,
        branchId,
        departmentId
      });

      await qb.run();
    }
  );

  consumeRPCQueue(
    'processes:removeWorks',
    async ({ subdomain, data: { dayPlans } }) => {
      const models = await generateModels(subdomain);
      return {
        status: 'success',
        data: { removedIds: await removeFromSalesPlans(models, dayPlans) }
      };
    }
  );

  consumeRPCQueue('processes:beforeResolver', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    return {
      data: await beforeResolverHandlers(models, data),
      status: 'success'
    };
    return;
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

export const sendInventoriesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'inventories',
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
