import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { debugBase } from '@erxes/api-utils/src/debuggers';
import { setTimeout } from 'timers';
import { receiveTrigger } from './utils';
import { serviceDiscovery } from './configs';
import { playWait } from './actions';
import { generateModels } from './connectionResolver';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue } = cl;

  consumeQueue('automations:trigger', async ({ subdomain, data }) => {
    debugBase(`Receiving queue data: ${JSON.stringify(data)}`);

    const models = await generateModels(subdomain);
    const { type, actionType, targets } = data;

    if (actionType && actionType === 'waiting') {
      await playWait(models, subdomain);
      return;
    }

    setTimeout(async () => {
      await receiveTrigger({ models, subdomain, type, targets });
    }, 10000);
  });

  consumeQueue('automations:find.count', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { query = {} } = data || {};

    return {
      status: 'success',
      data: await models.Automations.countDocuments(query)
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

export const sendSegmentsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'segments',
    ...args
  });
};

export default function() {
  return client;
}
