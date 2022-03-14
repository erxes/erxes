import { debugBase } from '@erxes/api-utils/src/debuggers';
import { serviceDiscovery } from './configs';
import { setTimeout } from 'timers';
import { receiveTrigger } from './utils';
import { playWait } from './actions';


const checkService = async (serviceName: string, needsList?: boolean) => {
  const enabled = await serviceDiscovery.isEnabled(serviceName);

  if (!enabled) {
    return needsList ? [] : null;
  }

  return;
};

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue } = cl;

  consumeQueue('erxes-automations:trigger', async param => {
    debugBase(`Receiving queue data from erxes-api: ${JSON.stringify(param)}`);

    const { type, actionType, targets } = param;

    if (actionType && actionType === 'waiting') {
      await playWait();
      return;
    }

    setTimeout(async () => {
      await receiveTrigger({ type, targets });
    }, 10000)
  });

};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const sendMessage = async (channel, message): Promise<any> => {
  return client.sendMessage(channel, message);
};

export default function () {
  return client;
}
