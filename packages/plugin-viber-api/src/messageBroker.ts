import * as dotenv from 'dotenv';
import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage as sendCommonMessage,
} from '@erxes/api-utils/src/core';

import {
  Customers,
  Integrations,
  Conversations,
  ConversationMessages,
  IConversation,
} from './models';
import { ViberAPI } from './viber/api';
import {
  InterMessage,
  RPResult,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

dotenv.config();

export const setupMessageConsumers = async () => {
  consumeRPCQueue(
    'viber:createIntegration',
    async (args: InterMessage): Promise<RPResult> => {
      const { subdomain, data } = args;
      const { integrationId, doc } = data;
      const docData = JSON.parse(doc.data);

      const viberIntegration = await Integrations.create({
        inboxId: integrationId,
        ...docData,
      });

      const viberApi: ViberAPI = new ViberAPI({
        token: docData.token,
        integrationId,
        subdomain,
      });

      // registering webhook
      try {
        await viberApi.registerWebhook();
      } catch (e) {
        await Integrations.deleteOne({ _id: viberIntegration._id });
        return {
          status: 'error',
          errorMessage: e,
        };
      }

      return {
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'integrations:updateIntegration',
    async ({ subdomain, data: { integrationId, doc } }) => {
      const details = JSON.parse(doc.data);

      const integration = await Integrations.findOne({
        inboxId: integrationId,
      });

      if (!integration) {
        return {
          status: 'error',
          errorMessage: 'Integration not found.',
        };
      }

      const viberApi: ViberAPI = new ViberAPI({
        token: details.token,
        integrationId,
        subdomain,
      });

      try {
        await viberApi.registerWebhook();
      } catch (e) {
        return {
          status: 'error',
          errorMessage: e,
        };
      }

      await Integrations.updateOne(
        { erxesApiId: integrationId },
        { $set: details },
      );

      return {
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'viber:integrationDetail',
    async (args: InterMessage): Promise<RPResult> => {
      const inboxId: string = args.data.inboxId;

      const viberIntegration = await Integrations.findOne({ inboxId }, 'token');

      return {
        status: 'success',
        data: { token: viberIntegration?.token },
      };
    },
  );

  consumeRPCQueue(
    'viber:removeIntegrations',
    async (args: InterMessage): Promise<RPResult> => {
      const { data } = args;
      const { integrationId } = data;

      await Customers.deleteMany({ inboxIntegrationId: integrationId });
      await Integrations.deleteMany({ inboxId: integrationId });

      const conversationIds: string[] = [];

      const conversationIdsKeys: IConversation[] = await Conversations.find(
        { integrationId },
        '_id',
      );

      conversationIdsKeys.map((key: IConversation): void => {
        conversationIds.push(key._id);
      });

      if (conversationIds.length > 0) {
        await ConversationMessages.deleteMany({
          conversationId: { $in: conversationIds },
        });
      }

      await Conversations.deleteMany({ integrationId });

      return {
        status: 'success',
      };
    },
  );

  consumeRPCQueue(
    'viber:api_to_integrations',
    async (args: InterMessage): Promise<RPResult> => {
      const { subdomain, data } = args;
      const integrationId = data.integrationId;

      const integration = await Integrations.findOne(
        { inboxId: integrationId },
        { inboxId: 1, token: 1 },
      );

      if (!integration) {
        return {
          status: 'error',
          errorMessage: 'Integration not found.',
        };
      }

      if (data.action === 'getDetails') {
        return {
          status: 'success',
          data: {
            token: integration.token,
          },
        };
      }

      if (data.action.includes('reply')) {
        try {
          const payload = JSON.parse(data.payload || '{}');
          const viberApi: ViberAPI = new ViberAPI({
            token: integration.token,
            integrationId,
            subdomain,
          });
          await viberApi.sendMessage(payload);
        } catch (e) {
          return {
            status: 'error',
            errorMessage: e.message,
          };
        }
      }

      return {
        status: 'success',
      };
    },
  );
};

export const sendContactsMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendInboxMessage = (args: MessageArgsOmitService) => {
  return sendCommonMessage({
    serviceName: 'inbox',
    ...args,
  });
};
