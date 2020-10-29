import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { receivePutLogCommand } from './utils';

dotenv.config();

let client;

export const initBroker = async server => {
  client = await messageBroker({
    name: 'logger',
    server,
    envs: process.env
  });

  const { consumeQueue } = client;

  consumeQueue('putLog', async data => {
    await receivePutLogCommand(data);
  });
};

export default function() {
  return client;
}
