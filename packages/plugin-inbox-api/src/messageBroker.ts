import {
  receiveIntegrationsNotification,
  receiveRpcMessage
} from './receiveMessage';
import { serviceDiscovery } from './configs';
import { generateModels, IModels } from './connectionResolver';
import {
  ISendMessageArgs,
  paginate,
  sendMessage
} from '@erxes/api-utils/src/core';
import { receiveVisitorDetail } from './widgetUtils';
import { sendToWebhook as sendWebhook } from '@erxes/api-utils/src';

export let client;

const createConversationAndMessage = async (
  models: IModels,
  userId,
  status,
  customerId,
  visitorId,
  integrationId,
  content,
  engageData
) => {
  // create conversation
  const conversation = await models.Conversations.createConversation({
    userId,
    status,
    customerId,
    visitorId,
    integrationId,
    content
  });

  // create message
  return models.ConversationMessages.createMessage({
    engageData,
    conversationId: conversation._id,
    userId,
    customerId,
    visitorId,
    content
  });
};

export const initBroker = cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

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
        engageData
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
        engageData
      );

      return { data: response, status: 'success' };
    }
  );

  consumeRPCQueue(
    'inbox:integrations.receive',
    async ({ subdomain, data }) => await receiveRpcMessage(subdomain, data)
  );

  consumeQueue('inbox:integrationsNotification', async ({ data }) => {
    await receiveIntegrationsNotification(data);
  });

  consumeRPCQueue(
    'inbox:integrations.find',
    async ({ subdomain, data: { query, options } }) => {
      const models = await generateModels(subdomain);

      const integrations = await models.Integrations.findIntegrations(
        query,
        options
      );

      return { data: integrations, status: 'success' };
    }
  );

  consumeQueue(
    'inbox:changeCustomer',
    async ({ subdomain, data: { customerId, customerIds } }) => {
      const models = await generateModels(subdomain);

      await models.Conversations.changeCustomer(customerId, customerIds);
    }
  );

  consumeRPCQueue(
    'inbox:getConversation',
    async ({ subdomain, data: { conversationId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conversations.findOne({ _id: conversationId }).lean()
      };
    }
  );

  consumeRPCQueue(
    'inbox:conversationMessages.findOne',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.ConversationMessages.findOne(data).lean()
      };
    }
  );

  consumeRPCQueue(
    'inbox:conversationMessages.find',
    async ({ subdomain, data }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.ConversationMessages.find(data).lean()
      };
    }
  );

  consumeRPCQueue('inbox:integrations.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Integrations.findOne(data).lean()
    };
  });

  consumeRPCQueue(
    'inbox:updateConversationMessage',
    async ({ subdomain, data: { filter, updateDoc } }) => {
      const models = await generateModels(subdomain);

      const updated = await models.ConversationMessages.updateOne(filter, {
        $set: updateDoc
      });

      return {
        data: updated,
        status: 'success'
      };
    }
  );

  consumeQueue(
    'inbox:removeCustomersConversations',
    async ({ subdomain, data: { customerIds } }) => {
      const models = await generateModels(subdomain);

      return models.Conversations.removeCustomersConversations(customerIds);
    }
  );

  consumeRPCQueue(
    'inbox:getConversations',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conversations.find(query).lean()
      };
    }
  );

  consumeRPCQueue(
    'inbox:conversations.count',
    async ({ subdomain, data: { query } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conversations.find(query).countDocuments()
      };
    }
  );

  consumeRPCQueue(
    'inbox:getConversationsList',
    async ({ subdomain, data: { query, listParams } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await paginate(models.Conversations.find(query), listParams)
      };
    }
  );

  consumeQueue('inbox:visitor.convertResponse', async ({ subdomain, data }) => {
    await receiveVisitorDetail(subdomain, data);
  });

  consumeRPCQueue('inbox:updateUserChannels', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { channelIds, userId } = data;

    return {
      status: 'success',
      data: await models.Channels.updateUserChannels(channelIds, userId)
    };
  });
};

export const sendContactsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendFormsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'forms',
    ...args
  });
};

export const sendCoreMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};

export const sendEngagesMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'engages',
    ...args
  });
};

export const sendCardsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'cards',
    ...args
  });
};

export const sendProductsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'products',
    ...args
  });
};

export const sendTagsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'tags',
    ...args
  });
};

export const sendIntegrationsMessage = (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'integrations',
    ...args
  });
};

export const sendSegmentsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'segments',
    ...args
  });
};

export const sendNotificationsMessage = (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'notifications',
    ...args
  });
};

export const sendKnowledgeBaseMessage = (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'knowledgebase',
    ...args
  });
};

export const sendLogsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'logs',
    ...args
  });
};

export const sendAutomationsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'automations',
    ...args
  });
};

export const sendToWebhook = ({ subdomain, data }) => {
  return sendWebhook(client, { subdomain, data });
};

export default function() {
  return client;
}
