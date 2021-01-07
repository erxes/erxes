import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { receivePutLogCommand, receiveVisitorLog } from './utils';

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

  consumeQueue('visitorLog', async data => {
    console.log('DATA = ', data);
    return await receiveVisitorLog(data);
  });
};

export default function() {
  return client;
}
