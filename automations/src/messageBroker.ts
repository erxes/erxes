import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { debugBase } from './debuggers';

dotenv.config();

let client;

export const initBroker = async server => {
  client = await messageBroker({
    name: 'automations',
    server,
    envs: process.env
  });

  const { consumeQueue } = client;

  consumeQueue('erxes-api:automations-notification', async ({ action, data }) => {
    debugBase(`Receiving queue data from erxes-api ${action} ${JSON.stringify(data)}`);
  });
};

export default function() {
  return client;
}
