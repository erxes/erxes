import * as dotenv from 'dotenv';

import { debugGmail } from './debuggers';
import { removeAccount, removeCustomers } from './helpers';

import messageBroker from 'erxes-message-broker';
import { handleFacebookMessage } from './facebook/handleFacebookMessage';
import { watchPushNotification } from './gmail/watch';
import { Integrations } from './models';
import { getLineWebhookUrl } from './smooch/api';

const handleRunCronMessage = async () => {
  const integrations = await Integrations.aggregate([
    {
      $match: { email: { $exists: true } }, // email field indicates the gmail
    },
    {
      $lookup: {
        from: 'accounts',
        localField: 'accountId',
        foreignField: '_id',
        as: 'accounts',
      },
    },
    {
      $unwind: '$accounts',
    },
    {
      $project: {
        access_token: '$accounts.token',
        refresh_token: '$accounts.tokenSecret',
        scope: '$accounts.scope',
        expire_date: '$accounts.expireDate',
      },
    },
  ]);

  if (!integrations) {
    return debugGmail('Gmail Integration not found');
  }

  for (const { _id, email } of integrations) {
    const response = await watchPushNotification(email);
    const { historyId, expiration } = response.data;

    if (!historyId || !expiration) {
      return debugGmail('Error Google: Failed to renew push notification');
    }

    await Integrations.updateOne({ _id }, { $set: { gmailHistoryId: historyId, expiration } });
  }
};

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

    if (action === 'remove-account') {
      try {
        response = {
          status: 'success',
          data: await removeAccount(data._id),
        };
      } catch (e) {
        response = {
          status: 'error',
          errorMessage: e.message,
        };
      }
    } else if (action === 'line-webhook') {
      try {
        response = {
          status: 'success',
          data: await getLineWebhookUrl(data._id),
        };
      } catch (e) {
        response = {
          status: 'error',
          errorMessage: e.message,
        };
      }
    }

    return response;
  });

  consumeQueue('erxes-api:integrations-notification', async content => {
    const { type } = content;

    switch (type) {
      case 'facebook':
        await handleFacebookMessage(content);
        break;
      case 'cronjob':
        await handleRunCronMessage();
        break;
      case 'removeCustomers':
        await removeCustomers(content);
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
