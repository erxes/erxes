import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

let client: any;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = cl;
  consumeQueue(
    'salesplans:dayPlans.updateStatus',
    async ({ subdomain, data: { _ids, status } }) => {
      const models = await generateModels(subdomain);

      await models.DayPlans.updateMany(
        { _id: { $in: _ids } },
        { $set: { status } }
      );
    }
  );

  consumeRPCQueue(
    'salesplans:timeframes.find',
    async ({ subdomain, data: {} }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Timeframes.find({
          status: { $ne: 'deleted' }
        }).lean()
      };
    }
  );
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export const sendInternalNotesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'internalnotes',
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

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
