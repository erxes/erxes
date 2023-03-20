import * as dotenv from 'dotenv';

import { removeAccount, removeCustomers, removeIntegration } from './helpers';

import { userIds } from './userMiddleware';
import { getConfig } from './utils';
import {
  callproCreateIntegration,
  callproGetAudio
} from './callpro/controller';
import {
  ISendMessageArgs,
  sendMessage as sendCommonMessage
} from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';

dotenv.config();

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue(
    'integrations:getAccounts',
    async ({ subdomain, data: { kind } }) => {
      const models = await generateModels(subdomain);

      const selector = { kind };

      return {
        data: await models.Accounts.find(selector).lean(),
        status: 'success'
      };
    }
  );

  // listen for rpc queue =========
  consumeRPCQueue(
    'integrations:api_to_integrations',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const { action } = data;

      let response: any = null;

      try {
        if (action === 'remove-account') {
          response = { data: await removeAccount(models, data._id) };
        }

        if (action === 'getTelnyxInfo') {
          response = {
            data: {
              telnyxApiKey: await getConfig(models, 'TELNYX_API_KEY'),
              integrations: await models.Integrations.find({ kind: 'telnyx' })
            }
          };
        }

        if (action === 'getConfigs') {
          response = { data: await models.Configs.find({}) };
        }

        response.status = 'success';
      } catch (e) {
        response = {
          status: 'error',
          errorMessage: e.message
        };
      }

      return response;
    }
  );

  // '/callpro/get-audio',
  consumeRPCQueue(
    'integrations:getCallproAudio',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await callproGetAudio(models, data),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'integrations:createIntegration',
    async ({ subdomain, data: { doc, kind } }) => {
      const models = await generateModels(subdomain);

      if (kind === 'callpro') {
        return callproCreateIntegration(models, doc);
      } else {
        return {
          status: 'error',
          errorMessage: `Unsupported kind: ${kind}`
        };
      }
    }
  );

  // '/integrations/remove',
  consumeRPCQueue(
    'integrations:removeIntegrations',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      await removeIntegration(models, integrationId);

      return { status: 'success' };
    }
  );

  consumeQueue('integrations:notification', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { payload, type } = data;

    switch (type) {
      case 'removeCustomers':
        await removeCustomers(models, data);
        break;
      case 'addUserId':
        userIds.push(payload._id);
        break;
      default:
        break;
    }
  });
};

export default function() {
  return client;
}

export const sendInboxMessage = (args: ISendMessageArgs) => {
  return sendCommonMessage({
    client,
    serviceDiscovery,
    serviceName: 'inbox',
    ...args
  });
};
