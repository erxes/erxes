import { receiveRpcMessage } from "./receiveMessage";
import { serviceDiscovery } from './configs';
import { generateModels, IModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage as sendMessageCore } from "@erxes/api-utils/src/core";

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

  // ! below code converted only used in engage
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

  // ? added new
  consumeRPCQueue(
    'inbox:createConversationAndMessage',
    async ({ subdomain, data }) => {
      const { userId, status, customerId, visitorId, integrationId, content, engageData } = data;
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


  // ! below queue converted only used in plugin-integrations
  consumeRPCQueue(
    'rpc_queue:integrations_to_api',
    async data => await receiveRpcMessage('', data)
  );

  // ? added new
  consumeRPCQueue(
    'inbox:integrations_to_api',
    async ({ subdomain, data }) => await receiveRpcMessage(subdomain, data)
  );

  // ! below queue converted
  consumeRPCQueue(
    'inbox:rpc_queue:findIntegrations',
    async ({ subdomain, query, options }) => {
      const models = await generateModels(subdomain);

      const integrations = await models.Integrations.findIntegrations(query, options);

      return { data: integrations, status: 'success' };
    }
  );

  // ? added new
  consumeRPCQueue(
    'inbox:integrations.find',
    async ({ subdomain, data: { query, options } }) => {
      const models = await generateModels(subdomain);

      const integrations = await models.Integrations.findIntegrations(query, options);

      return { data: integrations, status: 'success' };
    }
  );


  // // ! below queue converted
  // consumeQueue('inbox:changeCustomer', async ({subdomain, customerId, customerIds}) => {
  //   const models = await generateModels(subdomain);

  //   await models.Conversations.changeCustomer(customerId, customerIds);
  // });

  // ? added new
  consumeQueue('inbox:changeCustomer', async ({subdomain, data: { customerId, customerIds }}) => {
    const models = await generateModels(subdomain);

    await models.Conversations.changeCustomer(customerId, customerIds);
  });

  // // ! below queue converted 
  // consumeRPCQueue(
  //   'inbox:rpc_queue:getConversation',
  //   async ({ subdomain, conversationId }) => {
  //     const models = await generateModels(subdomain)

  //     return {
  //       status: 'success',
  //       data: await models.Conversations.findOne({ _id: conversationId })

  //     }
  //   }
  // );

  // ? added new
  consumeRPCQueue(
    'inbox:getConversation',
    async ({ subdomain, data: { conversationId } }) => {
      const models = await generateModels(subdomain);

      return {
        status: 'success',
        data: await models.Conversations.findOne({ _id: conversationId })
      };
    }
  );

  // ! below queue converted only used in api-core
  // ! unused queue
  consumeRPCQueue('inbox:rpc_queue:getIntegration', async data => {
    const { _id, subdomain } = data;

    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Integrations.findOne({ _id })
    };
  });

  // ? added new
  consumeRPCQueue('inbox:getIntegration', async ({ subdomain, data: { _id } }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Integrations.findOne({ _id })
    };
  });


  // ! below queue converted
  // ? used in engage 
  consumeRPCQueue('inbox:updateConversationMessage', async ({ data }) => {
    const { filter, updateDoc, subdomain } = data;
    const models = await generateModels(subdomain);

    const updated = await models.ConversationMessages.updateOne(filter, { $set: updateDoc });

    return {
      data: updated,
      status: 'success'
    }
  });

  // ? added new
  consumeRPCQueue('inbox:updateConversationMessage', async ({ subdomain, data: { filter, updateDoc } }) => {
    const models = await generateModels(subdomain);

    const updated = await models.ConversationMessages.updateOne(filter, { $set: updateDoc });

    return {
      data: updated,
      status: 'success'
    }
  });

  // ! below queue converted
  consumeQueue('inbox:removeCustomersConversations', async ({ customerIds, subdomain }) => {
    const models = await generateModels(subdomain);

    return models.Conversations.removeCustomersConversations(customerIds);
  });

  // ? added new
  consumeQueue('inbox:removeCustomersConversations', async ({ subdomain, data: { customerIds } }) => {
    const models = await generateModels(subdomain);

    return models.Conversations.removeCustomersConversations(customerIds);
  });

  // ? added new
  consumeRPCQueue('inbox:getConversations', async ({ subdomain, data: { query } }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Conversations.find(query).lean()
    }
  })
};

// ! channelMutations, conversationMutations, integrationMutations, widgetMutations
export const sendMessage = async (channel, message): Promise<any> => {
  return client.sendMessage(channel, message);
};

// ? added new
export const sendContactsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessageCore({ client, serviceDiscovery, serviceName: 'contacts', ...args });
};

// ? added new
export const sendFormsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessageCore({ client, serviceDiscovery, serviceName: "forms", ...args });
}

// ? added new
export const sendCoreMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessageCore({ client, serviceDiscovery, serviceName: "core", ...args })
}

// ? added new
export const sendEngagesMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessageCore({ client, serviceDiscovery, serviceName: "engages", ...args })
}

// ? added new
export const sendCardsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessageCore({ client, serviceDiscovery, serviceName: 'cards', ...args })
}

// ? added new
export const sendProductsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessageCore({ client, serviceDiscovery, serviceName: "products", ...args});
}

// ? added new
export const sendTagsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessageCore({ client, serviceDiscovery, serviceName: 'tags', ...args });
}

// ? added new integraiontsMsg
export const sendIntegrationsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessageCore({ client, serviceDiscovery, serviceName: 'integratons', ...args })
}

// ! widgetUtils, widgetMutations
export const sendToLog = (channel: string, data) =>
  client.sendMessage(channel, data);

// ? added new
export const sendSegmentsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessageCore({ client, serviceDiscovery, serviceName: 'segments', ...args });
}

// ? added new
export const sendNotificationsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessageCore({ client, serviceDiscovery, serviceName: 'notifications', ...args });
}

export default function() {
  return client;
}
