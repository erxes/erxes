import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { receivePutLogCommand } from './utils';

dotenv.config();

let client;

export const initBroker = async () => {
  client = await messageBroker({ name: 'logger', RABBITMQ_HOST: process.env.RABBITMQ_HOST });

  const { consumeQueue } = client;

  consumeQueue('putLog', async data => {
    await receivePutLogCommand(data);
  });
};

export default client;
