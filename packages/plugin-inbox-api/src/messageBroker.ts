import {
  receiveIntegrationsNotification,
  receiveRpcMessage,
} from './receiveMessage';

import { generateModels, IModels } from './connectionResolver';
import { paginate, sendMessage } from '@erxes/api-utils/src/core';
import { MessageArgs, MessageArgsOmitService } from '@erxes/api-utils/src/core';
import { receiveVisitorDetail } from './widgetUtils';
import { getIntegrationsKinds } from './utils';
import { sendNotifications } from './graphql/resolvers/conversationMutations';
import { pConversationClientMessageInserted } from './graphql/resolvers/widgetMutations';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

const createConversationAndMessage = async (
  models: IModels,
  userId,
  status,
  customerId,
  visitorId,
  integrationId,
  content,
  engageData,
) => {
  // create conversation
  const conversation = await models.Conversations.createConversation({
    userId,
    status,
    customerId,
    visitorId,
    integrationId,
    content,
  });

  // create message
  return models.ConversationMessages.createMessage({
    engageData,
    conversationId: conversation._id,
    userId,
    customerId,
    visitorId,
    content,
  });
};

export const setupMessageConsumers = () => {
  consumeRPCQueue(
    'inbox:createConversationAndMessage',
    async ({ subdomain, data }) => {
      const {
        userId,
        status,
        customerId,
        visitorId,
        integrationId,
        content,
        engageData,
      } = data;
      const models = await generateModels(subdomain);

      const response = await createConversationAndMessage(
        models,
        userId,
        status,
        customerId,
        visitorId,
        integrationId,
        content,
        engageData,
      );

      return { data: response, status: 'success' };
    },
  );

  consumeRPCQueue(
    'inbox:createOnlyMessage',
    async ({
      subdomain,
      data: {
        conversationId,
        content,
        userId,
        customerId,
        internal,
        contentType,
      },
    }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.ConversationMessages.createMessage({
          conversationId,
          internal,
          userId,
          customerId,
          content,
          contentType,
        }),
      };
    },
  );

  consumeRPCQueue('inbox:integrations.receive', async ({ subdomain, data }) => {
    return receiveRpcMessage(subdomain, data);
  });

  consumeQueue(
    'inbox:integrationsNotification',
    async ({ subdomain, data }) => {
      await receiveIntegrationsNotification(subdomain, data);
    },
  );

  consumeRPCQueue(
    'inbox:integrations.find',
    async ({ subdomain, data: { query, options } }) => {
      const models = await generateModels(subdomain);

      const integrations = await models.Integrations.findIntegrations(
        query,
        options,
      );

      return { data: integrations, status: 'success' };
    },
  );

  consumeRPCQueue(
    'inbox:integrations.count',
    async ({ subdomain, data: { selector } }) => {
      const models = await generateModels(subdomain);

      const count = await models.Integrations.countDocuments(selector);

      return { data: count, status: 'success' };
    },
  );

  consumeQueue(
    'inbox:changeCustomer',
    async ({ subdomain, data: { customerId, customerIds } }) => {
      const models = await generateModels(subdomain);

      await models.Conversations.changeCustomer(customerId, customerIds);
    },
  );

  consumeRPCQueue(
    'inbox:getConversation',
    async ({ subdomain, data: { conversationId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conversations.findOne({
          _id: conversationId,
        }).lean(),
      };
    },
  );

  consumeRPCQueue(
    'inbox:conversationMessages.findOne',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.ConversationMessages.findOne(data).lean(),
      };
    },
  );

  consumeRPCQueue(
    'inbox:conversationMessages.find',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.ConversationMessages.find(data).lean(),
      };
    },
  );

  consumeRPCQueue('inbox:integrations.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Integrations.findOne(data).lean(),
    };
  });

  consumeRPCQueue(
    'inbox:updateConversationMessage',
    async ({ subdomain, data: { filter, updateDoc } }) => {
      const models = await generateModels(subdomain);

      const updated = await models.ConversationMessages.updateOne(filter, {
        $set: updateDoc,
      });

      return {
        data: updated,
        status: 'success',
      };
    },
  );

  consumeQueue(
    'inbox:removeCustomersConversations',
    async ({ subdomain, data: { customerIds } }) => {
      const models = await generateModels(subdomain);

      return models.Conversations.removeCustomersConversations(customerIds);
    },
  );

  consumeQueue(
    'inbox:removeConversation',
    async ({ subdomain, data: { _id } }) => {
      const models = await generateModels(subdomain);

      await models.ConversationMessages.deleteMany({ conversationId: _id });
      return models.Conversations.deleteOne({ _id });
    },
  );

  consumeRPCQueue(
    'inbox:getConversations',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conversations.find(query).lean(),
      };
    },
  );

  consumeRPCQueue(
    'inbox:conversations.findOne',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conversations.findOne(query),
      };
    },
  );

  consumeRPCQueue(
    'inbox:conversations.changeStatus',
    async ({ subdomain, data: { id, status } }) => {
      const models = await generateModels(subdomain);

      if (id && status) {
        return {
          status: 'success',
          data: await models.Conversations.updateOne(
            { _id: id },
            { status: status },
          ),
        };
      }
      return {
        status: 'error',
        errorMessage:
          'id and status are required. id is ${id} and status is ${status}',
      };
    },
  );

  consumeRPCQueue(
    'inbox:conversations.count',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conversations.find(query).countDocuments(),
      };
    },
  );

  consumeRPCQueue(
    'inbox:getConversationsList',
    async ({ subdomain, data: { query, listParams } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await paginate(models.Conversations.find(query), listParams),
      };
    },
  );

  consumeQueue('inbox:visitor.convertResponse', async ({ subdomain, data }) => {
    await receiveVisitorDetail(subdomain, data);
  });

  consumeRPCQueue('inbox:updateUserChannels', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { channelIds, userId } = data;

    return {
      status: 'success',
      data: await models.Channels.updateUserChannels(channelIds, userId),
    };
  });

  consumeRPCQueue('inbox:channels.find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Channels.find(data),
    };
  });

  consumeRPCQueue('inbox:getIntegrationKinds', async () => {
    return {
      status: 'success',
      data: await getIntegrationsKinds(),
    };
  });

  consumeRPCQueue(
    'inbox:getModuleRelation',
    async ({ data: { module, target } }) => {
      let filter;

      if (module.includes('contacts')) {
        const queryField =
          target[module.includes('company') ? 'companyId' : 'customerId'];

        if (queryField) {
          filter = {
            _id: queryField,
          };
        }
      }

      return {
        status: 'success',
        data: filter,
      };
    },
  );

  consumeQueue('inbox:sendNotifications', async ({ data, subdomain }) => {
    await sendNotifications(subdomain, data);
  });

  consumeQueue(
    'inbox:conversationClientMessageInserted',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      await pConversationClientMessageInserted(models, subdomain, data);
    },
  );

  consumeRPCQueue(
    'inbox:widgetsGetUnreadMessagesCount',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.ConversationMessages.widgetsGetUnreadMessagesCount(
          data.conversationId,
        ),
      };
    },
  );
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string },
): Promise<any> => {
  return sendMessage({
    ...args,
  });
};

export const sendContactsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendFormsMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'forms',
    ...args,
  });
};

export const sendCoreMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendEngagesMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'engages',
    ...args,
  });
};

export const sendCardsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args,
  });
};

export const sendProductsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'products',
    ...args,
  });
};

export const sendTagsMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: 'tags',
    ...args,
  });
};

export const sendIntegrationsMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'integrations',
    ...args,
  });
};

export const sendSegmentsMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'segments',
    ...args,
  });
};

export const sendNotificationsMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'notifications',
    ...args,
  });
};

export const sendKnowledgeBaseMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'knowledgebase',
    ...args,
  });
};

export const sendLogsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'logs',
    ...args,
  });
};

export const sendAutomationsMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'automations',
    ...args,
  });
};

export const fetchSegment = (
  subdomain: string,
  segmentId: string,
  options?,
  segmentData?: any,
) =>
  sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: { segmentId, options, segmentData },
    isRPC: true,
  });

export const sendCallsMessage = (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'calls',
    ...args,
  });
};
