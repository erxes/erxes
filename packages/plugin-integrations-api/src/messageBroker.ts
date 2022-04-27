import * as dotenv from 'dotenv';
import { removeAccount, removeCustomers, removeIntegration, repairIntegrations } from './helpers';

import { Accounts, Configs } from './models';
import { handleFacebookMessage } from './facebook/handleFacebookMessage';
import { Integrations } from './models';
import { userIds } from './userMiddleware';
import { getConfig } from './utils';
import { debugGmail } from './debuggers';
import { getMessage as gmailGetMessage, sendEmail } from './gmail/handleController';
import { facebookCreateIntegration, facebookGetCustomerPosts } from './facebook/controller';
import { callproCreateIntegration, callproGetAudio } from './callpro/controller';
import { chatfuelCreateIntegration, chatfuelReply } from './chatfuel/controller';
import { gmailCreateIntegration } from './gmail/controller';
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

      if (action === 'getMessage') {
        const { path, erxesApiMessageId, integrationId } = data;

        if (!erxesApiMessageId) {
          throw new Error('erxesApiMessageId is not provided!');
        }

        switch (path) {
          case '/gmail/get-message':
            response = await gmailGetMessage(erxesApiMessageId, integrationId);
            break;
          default:
            break;
        }
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
        case 'chatfuel':
          return chatfuelCreateIntegration(doc);
        case 'gmail':
          return gmailCreateIntegration(doc);
      }
    }
  );

  // '/integrations/remove',
  consumeRPCQueue('integrations:removeIntegrations', async ({ subdomain, data: { integrationId }}) => {
    const models = await generateModels(subdomain);

    await removeIntegration(models, integrationId);

    return { status: 'success' };
  });

  //  '/nylas/send', /gmail/send
  consumeRPCQueue('integrations:sendEmail', async ({ data: { kind, doc }}) => {
    const { data, erxesApiId } = doc;

    if(kind === 'gmail') {
      debugGmail(`Sending gmail ===`);

      const mailParams = JSON.parse(data);

      await sendEmail(erxesApiId, mailParams);

      return { status: 200, statusText: 'success' };
    }
  })

  consumeRPCQueue('integrations:reply', async ({ data }) => {
    switch(data.requestName) {
      case "replyChatfuel":
        await chatfuelReply(data);
        break;
      default:
        break;
    }
  })

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
