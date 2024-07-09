import * as dotenv from 'dotenv';
import { sendMessage } from '@erxes/api-utils/src/core';

import {
  facebookCreateIntegration,
  facebookGetCustomerPosts,
  removeAccount,
  removeCustomers,
  removeIntegration,
  repairIntegrations
} from './helpers';
import { handleFacebookMessage } from './handleFacebookMessage';
import { userIds } from './middlewares/userMiddleware';

import { sendMessage as sendCommonMessage } from '@erxes/api-utils/src/core';
import { MessageArgs, MessageArgsOmitService } from '@erxes/api-utils/src/core';

import { generateModels } from './connectionResolver';
import {
  InterMessage,
  RPResult,
  consumeQueue,
  consumeRPCQueue,
  sendRPCMessage
} from '@erxes/api-utils/src/messageBroker';

dotenv.config();

export const setupMessageConsumers = async () => {
  consumeRPCQueue(
    'facebook:getAccounts',
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
    'facebook:updateIntegration',
    async ({ subdomain, data: { integrationId, doc } }) => {
      const models = await generateModels(subdomain);
      const details = JSON.parse(doc.data);

      const integration = await models.Integrations.findOne({
        erxesApiId: integrationId
      });

      if (!integration) {
        return {
          status: 'error',
          errorMessage: 'Integration not found.'
        };
      }
      await models.Integrations.updateOne(
        { erxesApiId: integrationId },
        { $set: details }
      );

      return {
        status: 'success'
      };
    }
  );
  // listen for rpc queue =========
  consumeRPCQueue(
    'facebook:api_to_integrations',
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

        if (type === 'facebook') {
          response.data = await handleFacebookMessage(models, data, subdomain);
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

  // /facebook/get-status'
  consumeRPCQueue(
    'facebook:getStatus',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.findOne({
        erxesApiId: integrationId
      });

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

  // /facebook/get-post
  consumeRPCQueue(
    'facebook:getPost',
    async ({ subdomain, data: { erxesApiId } }) => {
      const models = await generateModels(subdomain);

      return {
        data: await models.PostConversations.findOne({ erxesApiId }),
        status: 'success'
      };
    }
  );

  // app.get('/facebook/get-customer-posts'
  consumeRPCQueue('facebook:getCustomerPosts', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await facebookGetCustomerPosts(models, data),
      status: 'success'
    };
  });

  consumeRPCQueue(
    'facebook:createIntegration',
    async ({ subdomain, data: { doc, kind } }) => {
      const models = await generateModels(subdomain);

      if (kind === 'facebook') {
        return facebookCreateIntegration(subdomain, models, doc);
      }

      return {
        status: 'error',
        errorMessage: 'Wrong kind'
      };
    }
  );

  // '/integrations/remove',
  consumeRPCQueue(
    'facebook:removeIntegrations',
    async ({ subdomain, data: { integrationId } }) => {
      const models = await generateModels(subdomain);

      await removeIntegration(subdomain, models, integrationId);

      return { status: 'success' };
    }
  );

  consumeQueue('facebook:notification', async ({ subdomain, data }) => {
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
    'facebook:conversationMessages.find',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.ConversationMessages.find(data).lean()
      };
    }
  );

  consumeRPCQueue(
    'facebook:getModuleRelation',
    async ({ data: { module, target } }) => {
      // need to check pos-order or pos

      let filter;

      if (module.includes('contacts')) {
        if (target.customerId) {
          filter = { _id: target.customerId };
        }
      }

      return {
        status: 'success',
        data: filter
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

export const getFileUploadConfigs = async (subdomain) =>
  sendRPCMessage('core:getFileUploadConfigs', { subdomain });
