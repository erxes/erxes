import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { setTimeout } from 'timers';
import { playWait } from './actions';
import { debugBase } from './debuggers';
import { receiveTrigger } from './utils';

dotenv.config();

let client;

export const initBroker = async (server?) => {
  client = await messageBroker({
    name: 'automations',
    server,
    envs: process.env
  });

  const { consumeQueue } = client;

  consumeQueue('erxes-automations:trigger', async param => {
    debugBase(`Receiving queue data from erxes-api: ${JSON.stringify(param)}`);

    const { type, actionType, targets } = param;

    if (actionType && actionType === 'waiting') {
      await playWait();
      return;
    }

    setTimeout(async () => {
      await receiveTrigger({ type, targets });
    }, 1000)
  });
};

export default function () {
  return client;
}

export const sendRPCMessage = async (action: string, data: any) => {
  return client.sendRPCMessage('rpc_queue:automations_to_api', {
    action,
    payload: JSON.stringify(data)
  });
}