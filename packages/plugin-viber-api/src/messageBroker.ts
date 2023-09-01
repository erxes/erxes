import * as dotenv from 'dotenv';
import {
  ISendMessageArgs,
  sendMessage as sendCommonMessage
} from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import {
  Customers,
  Integrations,
  Conversations,
  ConversationMessages,
  IConversation
} from './models';
import { ViberAPI } from './viber/api';

dotenv.config();

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue(
    'viber:createIntegration',
    async (args: ISendMessageArgs): Promise<any> => {
      const { subdomain, data } = args;
      const { integrationId, doc } = data;
      const docData = JSON.parse(doc.data);

      const viberIntegration = await Integrations.create({
        inboxId: integrationId,
        ...docData
      });

      const viberApi: ViberAPI = new ViberAPI({
        token: docData.token,
        integrationId,
        subdomain
      });

      // registering webhook
      try {
        await viberApi.registerWebhook();
      } catch (e) {
        await Integrations.deleteOne({ _id: viberIntegration._id });
        return {
          status: 'failed',
          errorMessage: e
        };
      }

      return {
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'integrations:updateIntegration',
    async ({ subdomain, data: { integrationId, doc } }) => {
      const details = JSON.parse(doc.data);

      const integration = await Integrations.findOne({
        inboxId: integrationId
      });

      if (!integration) {
        return {
          status: 'error',
          errorMessage: 'Integration not found.'
        };
      }

      const viberApi: ViberAPI = new ViberAPI({
        token: details.token,
        integrationId,
        subdomain
      });

      try {
        await viberApi.registerWebhook();
      } catch (e) {
        return {
          status: 'error',
          errorMessage: e
        };
      }

      await Integrations.updateOne(
        { erxesApiId: integrationId },
        { $set: details }
      );

      return {
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'viber:integrationDetail',
    async (args: ISendMessageArgs): Promise<any> => {
      const inboxId: string = args.data.inboxId;

      const viberIntegration = await Integrations.findOne({ inboxId }, 'token');

      return {
        status: 'success',
        data: { token: viberIntegration?.token }
      };
    }
  );

  consumeRPCQueue(
    'viber:removeIntegrations',
    async (args: ISendMessageArgs): Promise<any> => {
      const { data } = args;
      const { integrationId } = data;

      await Customers.deleteMany({ inboxIntegrationId: integrationId });
      await Integrations.deleteMany({ inboxId: integrationId });

      const conversationIds: string[] = [];

      const conversationIdsKeys: IConversation[] = await Conversations.find(
        { integrationId },
        '_id'
      );

      conversationIdsKeys.map((key: IConversation): void => {
        conversationIds.push(key._id);
      });

      if (conversationIds.length > 0) {
        await ConversationMessages.deleteMany({
          conversationId: { $in: conversationIds }
        });
      }

      await Conversations.deleteMany({ integrationId });

      return {
        status: 'success'
      };
    }
  );

  consumeRPCQueue(
    'viber:api_to_integrations',
    async (args: ISendMessageArgs): Promise<any> => {
      const { subdomain, data } = args;
      const integrationId = data.integrationId;

      const integration = await Integrations.findOne(
        { inboxId: integrationId },
        { inboxId: 1, token: 1 }
      );

      if (!integration) {
        return {
          status: 'success',
          data: null
        };
      }

      if (data.action === 'getDetails') {
        return {
          status: 'success',
          data: {
            token: integration.token
          }
        };
      }

      if (data.action.includes('reply')) {
        const payload = JSON.parse(data.payload || '{}');
        const viberApi: ViberAPI = new ViberAPI({
          token: integration.token,
          integrationId,
          subdomain
        });
        await viberApi.sendMessage(payload);
      }

      return {
        status: 'success'
      };
    }
  );
};

export default function() {
  return client;
}

export const sendContactsMessage = (args: ISendMessageArgs) => {
  return sendCommonMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendInboxMessage = (args: ISendMessageArgs) => {
  return sendCommonMessage({
    client,
    serviceDiscovery,
    serviceName: 'inbox',
    ...args
  });
};
