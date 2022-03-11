import { receiveRpcMessage } from "./receiveMessage";
import { serviceDiscovery } from './configs';
import { generateModels, IModels } from './connectionResolver';

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

export const initBroker = (cl) => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeRPCQueue(
    'inbox:rpc_queue:createConversationAndMessage',
    async (doc) => {
      const { subdomain, userId, status, customerId, visitorId, integrationId, content, engageData } = doc;
      const models = await generateModels(subdomain); 

      const data = await createConversationAndMessage(
        models,
        userId,
        status,
        customerId,
        visitorId,
        integrationId,
        content,
        engageData
      );

      return { data, status: 'success' };
    }
  );

  consumeRPCQueue(
    'rpc_queue:integrations_to_api',
    async data => await receiveRpcMessage(data)
  );

  consumeRPCQueue(
    'inbox:rpc_queue:findIntegrations',
    async ({ subdomain, query, options }) => {
      const models = await generateModels(subdomain);

      const integrations = await models.Integrations.findIntegrations(query, options);

      return { data: integrations, status: 'success' };
    }
  );

  consumeQueue('inbox:changeCustomer', async ({subdomain, customerId, customerIds}) => {
    const models = await generateModels(subdomain);

    await models.Conversations.changeCustomer(customerId, customerIds);
  });

  consumeRPCQueue(
    'inbox:rpc_queue:getConversation',
    async ({ subdomain, conversationId }) => {
      const models = await generateModels(subdomain)

      return {
        status: 'success',
        data: await models.Conversations.findOne({ _id: conversationId })

      }
    }
  );

  consumeRPCQueue('inbox:rpc_queue:getIntegration', async data => {
    const { _id, subdomain } = data;

    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Integrations.findOne({ _id })
    };
  });

  consumeRPCQueue('inbox:rpc_queue:updateConversationMessage', async (data) => {
    const { filter, updateDoc, subdomain } = data;
    const models = await generateModels(subdomain);

    const updated = await models.ConversationMessages.updateOne(filter, { $set: updateDoc });

    return {
      data: updated,
      status: 'success'
    }
  });

  consumeQueue('inbox:removeCustomersConversations', async ({ customerIds, subdomain }) => {
    const models = await generateModels(subdomain);

    return models.Conversations.removeCustomersConversations(customerIds);
  });

  consumeRPCQueue('inbox:rpc_queue:logs:getConversations', async ({ subdomain, query }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Conversations.find(query).lean()
    }
  })
};

export const sendMessage = async (channel, message): Promise<any> => {
  return client.sendMessage(channel, message);
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const sendContactMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`contacts:${action}`, data);
};

export const sendContactRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`contacts:rpc_queue:${action}`, data);
};

export const sendFormRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`forms:rpc_queue:${action}`, data);
};

export const sendConformityMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`conformities:${action}`, data);
};

export const sendEngageMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`engages:rpc_queue:${action}`, data);
};

export const sendCardsRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`cards:rpc_queue:${action}`, data);
};

export const sendProductRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`products:rpc_queue:${action}`, data);
};

export const sendProductCategoryRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`productCategories:rpc_queue:${action}`, data);
};

export const sendTagRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`tags:rpc_queue:${action}`, data);
};

export const sendToLog = (channel: string, data) =>
  client.sendMessage(channel, data);

export const fetchSegment = (segment, options?) =>
  sendSegmentMessage('fetchSegment', { segment, options }, true)

export const sendSegmentMessage = async (action, data, isRPC?: boolean) => {
  if (!isRPC) {
    return sendMessage(`segments:${action}`, data);
  }

  if(!(await serviceDiscovery.isAvailable('segments'))) {
    throw new Error("Segments service is not available");
  }

  sendMessage(`segments:rpc_queue:${action}`, data);
}

export const findMongoDocuments = async (serviceName: string, data: any) => {
  if(!(await serviceDiscovery.isEnabled(serviceName))) {
    return [];
  }
  
  if(!(await serviceDiscovery.isAvailable(serviceName))) {
    throw new Error(`${serviceName} service is not available.`);
  }

  return client.sendRPCMessage(`${serviceName}:rpc_queue:findMongoDocuments`, data);
};

export default function() {
  return client;
}
