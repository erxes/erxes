import * as dotenv from 'dotenv';
import { removeAccount, removeCustomers, removeIntegration, repairIntegrations } from './helpers';

import { Accounts, Configs } from './models';
import { handleFacebookMessage } from './facebook/handleFacebookMessage';
import { Integrations } from './models';
import { userIds } from './userMiddleware';
import { getConfig } from './utils';
import { facebookCreateIntegration, facebookGetCustomerPosts } from './facebook/controller';
import { callproCreateIntegration, callproGetAudio } from './callpro/controller';
import { ISendMessageArgs, sendMessage as sendCommonMessage } from '@erxes/api-utils/src/core'
import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';

dotenv.config();

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue('integrations:getAccounts', async ({ data: { kind } }) => {
    const selector = { kind };

    return {
      data: await Accounts.find(selector),
      status: 'success'
    };
  });

  // listen for rpc queue =========
  consumeRPCQueue('integrations:api_to_integrations', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { action, type } = data;

    let response: any = null;

    try {
      if (action === 'remove-account') {
        response = { data: await removeAccount(models, data._id) };
      }

      if (action === 'getTelnyxInfo') {
        response = {
          data: {
            telnyxApiKey: await getConfig('TELNYX_API_KEY'),
            integrations: await Integrations.find({ kind: 'telnyx' })
          }
        };
      }

      if (action === 'repair-integrations') {
        response = { data: await repairIntegrations(data._id) };
      }

      if (type === 'facebook') {
        response = { data: await handleFacebookMessage(models, data) };
      }

      if (action === 'getConfigs') {
        response = { data: await Configs.find({}) };
      }

      response.status = 'success';
    } catch (e) {
      response = {
        status: 'error',
        errorMessage: e.message
      };
    }

    return response;
  });

  // /facebook/get-status'
  consumeRPCQueue(
    'integrations:getFacebookStatus',
    async ({ data: { integrationId } }) => {
      const integration = await Integrations.findOne({
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

  // /facebook/get-post
  consumeRPCQueue(
    'integrations:getFacebookPost',
    async ({ subdomain, data: { erxesApiId } }) => {
      const models = await generateModels(subdomain);

      const post = await models.FbPosts.getPost({ erxesApiId }, true);

      return {
        data: post,
        status: 'success'
      };
    }
  );

  // app.get('/facebook/get-customer-posts'
  consumeRPCQueue(
    'integrations:getFbCustomerPosts',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        data: await facebookGetCustomerPosts(models, data),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'integrations:createIntegration',
    async ({ data: { doc, kind } }) => {
      switch (kind) {
        case 'facebook':
          return facebookCreateIntegration(doc);
        case 'callpro':
          return callproCreateIntegration(doc);
      }
    }
  );

  // '/integrations/remove',
  consumeRPCQueue('integrations:removeIntegrations', async ({ subdomain, data: { integrationId }}) => {
    const models = await generateModels(subdomain);

    await removeIntegration(models, integrationId);

    return { status: 'success' };
  });

  consumeQueue('integrations:notification', async ({ subdomain, data })  => {
    const models = await generateModels(subdomain);

    const { action, payload, type } = data;

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
   serviceName: "inbox",
   ...args
 }) 
}
