import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';
import { debugBase } from './debuggers';
import { Logs } from './models';
import { sendBulkSms, start } from './sender';

dotenv.config();

let client;

export const initBroker = async server => {
  client = await messageBroker({
    name: 'logger',
    server,
    envs: process.env
  });

  const { consumeQueue } = client;

  // listen for rpc queue =========
  consumeQueue('erxes-api:engages-notification', async ({ action, data }) => {
    debugBase(`Receiving queue data from erxes-api ${JSON.stringify(data)}`);

    if (action === 'sendEngage') {
      await start(data);
    }

    if (action === 'writeLog') {
      await Logs.createLog(data.engageMessageId, 'regular', data.msg);
    }

    if (action === 'sendEngageSms') {
      await sendBulkSms(data);
    }
  });
};

export const sendRPCMessage = async (message): Promise<any> => {
  return client.sendRPCMessage('rpc_queue:api_to_integrations', message);
};

export const removeEngageConversations = async (_id): Promise<any> => {
  return client.consumeQueue('removeEngageConversations', _id);
};

export const registerOnboardHistory = async (
  type: string,
  user: any
): Promise<any> => {
  return client.consumeQueue('registerOnboardHistory', type, user);
};

export default function() {
  return client;
}
