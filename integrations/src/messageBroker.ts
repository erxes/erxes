import * as dotenv from 'dotenv';
import { removeAccount, removeCustomers } from './helpers';

import messageBroker from 'erxes-message-broker';
import { handleFacebookMessage } from './facebook/handleFacebookMessage';
import { Integrations } from './models';
import { getLineWebhookUrl } from './smooch/api';
import { sendSms } from './telnyx/api';
import { userIds } from './userMiddleware';
import { getConfig } from './utils';

dotenv.config();

let client;

export const initBroker = async server => {
  client = await messageBroker({
    name: 'integrations',
    server,
    envs: process.env,
  });

  const { consumeQueue, consumeRPCQueue } = client;

  // listen for rpc queue =========
  consumeRPCQueue('rpc_queue:api_to_integrations', async parsedObject => {
    const { action, data } = parsedObject;

    let response = null;

    try {
      if (action === 'remove-account') {
        response = { data: await removeAccount(data._id) };
      }

      if (action === 'line-webhook') {
        response = { data: await getLineWebhookUrl(data._id) };
      }

      if (action === 'getTelnyxInfo') {
        response = {
          data: {
            telnyxApiKey: await getConfig('TELNYX_API_KEY'),
            integrations: await Integrations.find({ kind: 'telnyx' }),
          },
        };
      }

      response.status = 'success';
    } catch (e) {
      response = {
        status: 'error',
        errorMessage: e.message,
      };
    }

    return response;
  });

  consumeQueue('erxes-api:integrations-notification', async content => {
    const { action, payload, type } = content;

    switch (type) {
      case 'facebook':
        await handleFacebookMessage(content);
        break;
      case 'removeCustomers':
        await removeCustomers(content);
        break;
      case 'addUserId':
        userIds.push(payload._id);
        break;
      default:
        break;
    }

    if (action === 'sendConversationSms') {
      await sendSms(payload);
    }
  });
};

export default function() {
  return client;
}

export const sendRPCMessage = async (message): Promise<any> => {
  return client.sendRPCMessage('rpc_queue:integrations_to_api', message);
};

export const sendMessage = async (data?: any) => {
  return client.sendMessage('integrationsNotification', data);
};
