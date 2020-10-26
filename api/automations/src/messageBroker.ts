import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';

import { checkTrigger } from './data/utils';
import { debugBase } from './debuggers';

dotenv.config();

let client;

const consumerHelperCheckTrigger = async msg => {
  const { action, data } = msg;

  let response = { status: 'error', data: {} };

  if (action === 'get-response-check-automation') {
    const triggerResponse = await checkTrigger(data);

    response = {
      status: 'success',
      data: triggerResponse,
    };
  }
  return response;
};

export const initBroker = async server => {
  // Consumer
  try {
    client = await messageBroker({
      name: 'erxes-automations',
      server,
      envs: process.env,
    });

    const { consumeRPCQueue } = client;

    // listen for rpc queue =========
    consumeRPCQueue('rpc_queue:erxes-api_erxes-automations', async data => consumerHelperCheckTrigger(data));

    consumeRPCQueue('rpc_queue:erkhet', async data => consumerHelperCheckTrigger(data));
  } catch (e) {
    debugBase(e.message);
  }
};

export default function () {
  return client;
}
