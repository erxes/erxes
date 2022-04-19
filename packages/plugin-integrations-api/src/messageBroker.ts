import * as dotenv from 'dotenv';
import { removeAccount, removeCustomers, removeIntegration, repairIntegrations } from './helpers';

import { Accounts, Configs } from './models';
import { handleFacebookMessage } from './facebook/handleFacebookMessage';
import { Integrations } from './models';
import { getLineWebhookUrl } from './smooch/api';
import { sendSms } from './telnyx/api';
import { userIds } from './userMiddleware';
import { getConfig } from './utils';
import { createDailyRoom, getDailyActiveRoom, getDailyRoom } from './videoCall/controller';
import { debugGmail, debugNylas } from './debuggers';
import { Posts } from './facebook/models';
import { getMessage as nylasGetMessage, nylasSendEmail } from './nylas/handleController';
import { getMessage as gmailGetMessage, sendEmail } from './gmail/handleController';
import { facebookCreateIntegration, facebookGetCustomerPosts } from './facebook/controller';
import { twitterCreateIntegration, twitterReply } from './twitter/controller';
import { smoochCreateIntegration, smoothReply } from './smooch/controller';
import { nylasCreateIntegration } from './nylas/controller';
import { callproCreateIntegration, callproGetAudio } from './callpro/controller';
import { chatfuelCreateIntegration, chatfuelReply } from './chatfuel/controller';
import { gmailCreateIntegration } from './gmail/controller';
import { telnyxCreateIntegration } from './telnyx/controller';
import { whatsappCreateIntegration, whatsappReply } from './whatsapp/controller';
import { ISendMessageArgs, sendMessage as sendCommonMessage } from '@erxes/api-utils/src/core'
import { serviceDiscovery } from './configs';

dotenv.config();

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue('integrations:getAccounts', async ({ data: { kind } }) => {
    if (kind.includes('nylas')) {
      kind = kind.split('-')[1];
    }

    const selector = { kind };

    return {
      data: await Accounts.find(selector),
      status: 'success'
    };
  });

  // listen for rpc queue =========
  consumeRPCQueue('integrations:api_to_integrations', async ({ data }) => {
    const { action, type } = data;

    let response: any = null;

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
            integrations: await Integrations.find({ kind: 'telnyx' })
          }
        };
      }

      if (action === 'repair-integrations') {
        response = { data: await repairIntegrations(data._id) };
      }

      if (type === 'facebook') {
        response = { data: await handleFacebookMessage(data) };
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
          case '/nylas/get-message':
            response = await nylasGetMessage(erxesApiMessageId, integrationId);
            break;
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

  // '/daily/room', get
  consumeRPCQueue(
    'integrations:getDailyRoom',
    async ({ data }) => {
      return {
        data: await getDailyRoom(data),
        status: 'success'
      };
    }
  );

  // '/daily/room', post create daily room
  consumeRPCQueue(
    'integrations:createDailyRoom',
    async ({ data }) => {
      return {
        data: await createDailyRoom(data),
        status: 'success' 
      }
    }
  );

  // '/daily/get-active-room',
  consumeRPCQueue(
    'integrations:getDailyActiveRoom',
    async ({ data }) => {
      return {
        data: await getDailyActiveRoom(data),
        status: 'success'
      };
    }
  );

  // '/callpro/get-audio',
  consumeRPCQueue(
    'integrations:getCallproAudio',
    async ({ data }) => {
      return {
        data: await callproGetAudio(data),
        status: 'success'
      };
    }
  );

  // /facebook/get-post
  consumeRPCQueue(
    'integrations:getFacebookPost',
    async ({ data: { erxesApiId } }) => {
      const post = await Posts.getPost({ erxesApiId }, true);

      return {
        data: post,
        status: 'success'
      };
    }
  );

  // app.get('/facebook/get-customer-posts'
  consumeRPCQueue(
    'integrations:getFbCustomerPosts',
    async ({ data }) => {
      return {
        data: await facebookGetCustomerPosts(data),
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'integrations:createIntegration',
    async ({ data: { doc, kind } }) => {
      switch (kind) {
        case 'nylas':
          return nylasCreateIntegration(doc);
        case 'facebook':
          return facebookCreateIntegration(doc);
        case 'twitter':
          return twitterCreateIntegration(doc);
        case 'smooch':
          return smoochCreateIntegration(doc);
        case 'callpro':
          return callproCreateIntegration(doc);
        case 'chatfuel':
          return chatfuelCreateIntegration(doc);
        case 'gmail':
          return gmailCreateIntegration(doc);
        case 'telnyx':
          return telnyxCreateIntegration(doc);
        default:
          // whatsapp
          return whatsappCreateIntegration(doc);
      }
    }
  );

  // '/integrations/remove',
  consumeRPCQueue('integrations:removeIntegrations', async ({ data: { integrationId }}) => {
    await removeIntegration(integrationId);

    return { status: 'success' };
  });

  //  '/nylas/send', /gmail/send
  consumeRPCQueue('integrations:sendEmail', async ({ data: { kind, doc }}) => {
    const { data, erxesApiId } = doc;

    if(kind === 'nylas') {
      debugNylas('Sending message...');

      const params = JSON.parse(data);

      await nylasSendEmail(erxesApiId, params);

      return { status: 'ok' };
    }

    if(kind === 'gmail') {
      debugGmail(`Sending gmail ===`);

      const mailParams = JSON.parse(data);

      await sendEmail(erxesApiId, mailParams);

      return { status: 200, statusText: 'success' };
    }
  })

  // /telnyx/send-sms
  consumeRPCQueue('integrations:sendSms', async ({ data }) => {
    const { integrationId, content, to } = data;

    const result = await sendSms(
      JSON.stringify({ integrationId, content, toPhone: to })
    );

    return result;
  })

  consumeRPCQueue('integrations:reply', async ({ data }) => {
    switch(data.requestName) {
      case "replyChatfuel":
        await chatfuelReply(data);
        break;
      case 'replyTwitterDm':
        await twitterReply(data);
        break;
      case 'replySmooch':
        await smoothReply(data)
        break;
      case 'replyWhatsApp':
        await whatsappReply(data)
        break;
      default:
        break;
    }
  })

  consumeQueue('integrations:notification', async ({ data })  => {
    const { action, payload, type } = data;

    switch (type) {
      case 'removeCustomers':
        await removeCustomers(data);
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

export const sendInboxMessage = (args: ISendMessageArgs) => {
 return sendCommonMessage({
   client,
   serviceDiscovery,
   serviceName: "inbox",
   ...args
 }) 
}
