import * as dotenv from 'dotenv';
import { removeAccount, removeCustomers, repairIntegrations } from './helpers';

import messageBroker from 'erxes-message-broker';
import { Accounts, Configs } from './models';
import { handleFacebookMessage } from './facebook/handleFacebookMessage';
import { Integrations } from './models';
import { getLineWebhookUrl } from './smooch/api';
import { sendSms } from './telnyx/api';
import { userIds } from './userMiddleware';
import { getConfig, getConfigs, getRecordings } from './utils';
import { CallRecords } from './videoCall/models';
import { sendDailyRequest, VIDEO_CALL_STATUS } from './videoCall/controller';
import { debugCallPro } from './debuggers';
import { Conversations as ConversationsCallPro } from './callpro/models';
import { Comments, Customers as CustomersFb, Posts } from './facebook/models';
import { getMessage as nylasGetMessage } from './nylas/handleController';
import { getMessage as gmailGetMessage } from './gmail/handleController';

dotenv.config();

let client;

export const initBroker = async server => {
  client = await messageBroker({
    name: 'integrations',
    server,
    envs: process.env
  });

  const { consumeRPCQueue, consumeQueue } = client;

  consumeRPCQueue('integrations:getAccounts', async ({ kind }) => {
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
  consumeRPCQueue('rpc_queue:api_to_integrations', async parsedObject => {
    const { action, data, type } = parsedObject;

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
        response = { data: await handleFacebookMessage(parsedObject) };
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
    'integrations:rpc_queue:getFacebookStatus',
    async ({ integrationId }) => {
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

  // '/daily/room',
  consumeRPCQueue(
    'integrations:rpc_queue:getDailyRoom',
    async ({ erxesApiMessageId }) => {
      const { DAILY_END_POINT } = await getConfigs();

      const callRecord = await CallRecords.findOne({ erxesApiMessageId });

      const response: {
        url?: string;
        status?: string;
        recordingLinks?: string[];
      } = { url: '', status: VIDEO_CALL_STATUS.END, recordingLinks: [] };

      if (callRecord) {
        response.url = `${DAILY_END_POINT}/${callRecord.roomName}?t=${callRecord.token}`;
        response.status = callRecord.status;

        const updatedRecordins = await getRecordings(
          callRecord.recordings || []
        );

        callRecord.recordings = updatedRecordins;
        await callRecord.save();

        response.recordingLinks = updatedRecordins.map(r => r.url);
      }

      return {
        data: response,
        status: 'success'
      };
    }
  );

  // '/daily/get-active-room',
  consumeRPCQueue(
    'integrations:rpc_queue:getDailyActiveRoom',
    async ({ erxesApiConversationId }) => {
      const { DAILY_END_POINT } = await getConfigs();

      const callRecord = await CallRecords.findOne({
        erxesApiConversationId,
        status: VIDEO_CALL_STATUS.ONGOING
      });

      const response: {
        url?: string;
        name?: string;
        recordingLinks?: string[];
      } = {
        recordingLinks: []
      };

      if (callRecord) {
        const ownerTokenResponse = await sendDailyRequest(
          '/api/v1/meeting-tokens/',
          'POST',
          {
            properties: { room_name: callRecord.roomName }
          }
        );

        response.url = `${DAILY_END_POINT}/${callRecord.roomName}?t=${ownerTokenResponse.token}`;
        response.name = callRecord.roomName;
      }

      return {
        data: response,
        status: 'success'
      };
    }
  );

  // '/callpro/get-audio',
  consumeRPCQueue(
    'integrations:rpc_queue:getCallproAudio',
    async ({ erxesApiId, integrationId }) => {
      const integration = await Integrations.findOne({
        erxesApiId: integrationId
      });

      if (!integration) {
        const message = 'Integration not found';
        debugCallPro(`Failed to get callprop audio: ${message}`);

        throw new Error(message);
      }

      const conversation = await ConversationsCallPro.findOne({ erxesApiId });

      if (!conversation) {
        const message = 'Conversation not found';

        debugCallPro(`Failed to get callprop audio: ${message}`);
        throw new Error(message);
      }

      const { recordUrl } = integration;
      const { callId } = conversation;

      let audioSrc = '';

      if (recordUrl) {
        audioSrc = `${recordUrl}&id=${callId}`;
      }

      return {
        data: audioSrc,
        status: 'success'
      };
    }
  );

  // /facebook/get-post
  consumeRPCQueue(
    'integrations:rpc_queue:getFacebookPost',
    async ({ erxesApiId }) => {
      const post = await Posts.getPost({ erxesApiId }, true);

      return {
        data: post,
        status: 'success'
      };
    }
  );

  // app.get('/facebook/get-customer-posts'
  consumeRPCQueue(
    'integrations:rpc_queue:getFbCustomerPosts',
    async ({ customerId }) => {
      const customer = await CustomersFb.findOne({ erxesApiId: customerId });

      if (!customer) {
        return null;
      }

      const result = await Comments.aggregate([
        { $match: { senderId: customer.userId } },
        {
          $lookup: {
            from: 'posts_facebooks',
            localField: 'postId',
            foreignField: 'postId',
            as: 'post'
          }
        },
        {
          $unwind: {
            path: '$post',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            conversationId: '$post.erxesApiId'
          }
        },
        {
          $project: { _id: 0, conversationId: 1 }
        }
      ]);

      const conversationIds = result.map(conv => conv.conversationId);

      return {
        data: conversationIds,
        status: 'success'
      };
    }
  );

  consumeQueue('erxes-api:integrations-notification', async content => {
    const { action, payload, type } = content;

    switch (type) {
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
