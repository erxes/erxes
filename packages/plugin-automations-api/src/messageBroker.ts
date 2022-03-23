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
      await playWait(models);
      return;
    }

    setTimeout(async () => {
      await receiveTrigger({ models, type, targets });
    }, 1000)
  });

};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const sendSegmentsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'segments', ...args });
};

export default function () {
  return client;
}
