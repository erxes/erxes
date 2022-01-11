import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';

dotenv.config();

let client;

export const initBroker = async server => {
  client = await messageBroker({
    name: 'logger',
    server,
    envs: process.env
  });

  // const { consumeQueue } = client;

  // // listen for rpc queue =========
  // consumeQueue('erxes-api:engages-notification', async ({ action, data }) => {
  // });
};

export const sendRPCMessage = async (message): Promise<any> => {
  return client.sendRPCMessage('rpc_queue:api_to_integrations', message);
};

export default function() {
  return client;
}
