import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

let client: any;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue } = cl;
  consumeQueue(
    'salesplans:saleslogs.statusUpdate',
    async ({ subdomain, data: { _id, status } }) => {
      const models = await generateModels(subdomain);

      const result = await models.SalesLogs.salesLogStatusUpdate(_id, status);

      return {
        data: result,
        status: 'success'
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
