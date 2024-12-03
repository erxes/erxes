import * as dotenv from 'dotenv';
import { sendMessage } from '@erxes/api-utils/src/core';

import {
  instagramCreateIntegration,
  removeAccount,
  removeCustomers,
  removeIntegration,
  repairIntegrations
} from './helpers';
import { handleInstagramMessage } from './handleInstagramMessage';
import { userIds } from './middlewares/userMiddleware';

import { sendMessage as sendCommonMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgs,
  MessageArgsOmitService
} from '@erxes/api-utils/src/core';

import { generateModels } from './connectionResolver';
import {
  consumeQueue,
  consumeRPCQueue,
  sendRPCMessage as RPC,
  RPResult
} from '@erxes/api-utils/src/messageBroker';

dotenv.config();

export const sendRPCMessage = async (message): Promise<any> => {
  return RPC('rpc_queue:integrations_to_api', message);
};

export const setupMessageConsumers = async () => {
  consumeRPCQueue(
    'instagram:getAccounts',
    async ({ subdomain, data: { kind } }) => {
      const models = await generateModels(subdomain);

      const selector = { kind };

      return {
        data: await models.Accounts.find(selector).lean(),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'instagram:api_to_integrations',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      const { action, type } = data;

      let response: RPResult = {
        status: 'success'
      };

      try {
        if (action === 'remove-account') {
          response.data = await removeAccount(subdomain, models, data._id);
        }

        if (action === 'repair-integrations') {
          response.data = await repairIntegrations(subdomain, models, data._id);
        }

        if (type === 'instagram') {
          response.data = await handleInstagramMessage(models, data, subdomain);
        }

        if (action === 'getConfigs') {
          response.data = await models.Configs.find({});
        }
      } catch (e) {
        response = {
          status: 'error',
          errorMessage: e.message
        };
      }

      return response;
    }
  );

  // /instagram/get-status'
  consumeRPCQueue(
    'instagram:getStatus',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        erxesApiId: integrationId
      });
      if (!integration) {
        throw new Error('Instagram Integration not found ');
      }
      let result = {
        status: 'healthy'
      } as any;

      if (integration) {
        result = {
          status: integration.healthStatus || 'healthy',
          error: integration.error
        };
      }

      return {
        data: result,
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'instagram:createIntegration',
    async ({ subdomain, data: { doc, kind } }) => {
      const models = await generateModels(subdomain);
      if (kind === 'instagram') {
        return instagramCreateIntegration(subdomain, models, doc);
      }

      return {
        status: 'error',
        errorMessage: 'Wrong kind'
      };
    }
  );

  // '/integrations/remove',
  consumeRPCQueue(
    'instagram:removeIntegrations',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      await removeIntegration(subdomain, models, integrationId);

      return { status: 'success' };
    }
  );

  consumeQueue('instagram:notification', async ({ subdomain, data }) => {
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

  consumeRPCQueue(
    'instagram:conversationMessages.find',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.ConversationMessages.find(data).lean()
      };
    }
  );
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args
  });
};
export const sendInboxMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: 'inbox',
    ...args
  });
};

export const sendAutomationsMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: 'automations',
    ...args
  });
};
