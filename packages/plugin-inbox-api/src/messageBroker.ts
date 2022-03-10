import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';
import { generateFieldsFromSchema } from '@erxes/api-utils/src';

import { ConversationMessages, Conversations } from './models';
import { receiveRpcMessage, collectConversations } from './receiveMessage';
import { serviceDiscovery } from './configs';
import { LOG_MAPPINGS } from './constants';
import { generateModels } from './connectionResolver';

export let client;

const createConversationAndMessage = async (
  userId,
  status,
  customerId,
  visitorId,
  integrationId,
  content,
  engageData
) => {
  // create conversation
  const conversation = await Conversations.createConversation({
    userId,
    status,
    customerId,
    visitorId,
    integrationId,
    content,
  });

  // create message
  return ConversationMessages.createMessage({
    engageData,
    conversationId: conversation._id,
    userId,
    customerId,
    visitorId,
    content,
  });
};

export const generateFields = async (args) => {
  const schema: any = Conversations.schema;

  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  // generate list using customer or company schema
  fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

  for (const name of Object.keys(schema.paths)) {
    const path = schema.paths[name];

    // extend fields list using sub schema fields
    if (path.schema) {
      fields = [
        ...fields,
        ...(await generateFieldsFromSchema(path.schema, `${name}.`)),
      ];
    }
  }

  return fields;
};

export const initBroker = (cl) => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeRPCQueue(
    'inbox:rpc_queue:createConversationAndMessage',
    async (doc) => {
      const {
        userId,
        status,
        customerId,
        visitorId,
        integrationId,
        content,
        engageData,
      } = doc;

      const data = await createConversationAndMessage(
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
    async (data) => await receiveRpcMessage(data)
  );

  consumeRPCQueue(
    'inbox:rpc_queue:findIntegrations',
    async ({ subdomain, query, options }) => {
      const models = await generateModels(subdomain);

      const integrations = await models.Integrations.findIntegrations(
        query,
        options
      );

      return { data: integrations, status: 'success' };
    }
  );

  consumeQueue('inbox:removeCustomersConversations', async (customerIds) => {
    await Conversations.removeCustomersConversations(customerIds);
  });

  consumeQueue('inbox:changeCustomer', async ({ customerId, customerIds }) => {
    await Conversations.changeCustomer(customerId, customerIds);
  });

  consumeRPCQueue('inbox:rpc_queue:getFields', async (args) => ({
    status: 'success',
    data: await generateFields(args),
  }));

  consumeRPCQueue('inbox:rpc_queue:tag', async (args) => {
    const { subdomain } = args;
    const models = await generateModels(subdomain);

    let data = {};
    let model: any = Conversations;

    if (args.type === 'integration') {
      model = models.Integrations;
    }

    if (args.action === 'count') {
      data = await model.countDocuments({ tagIds: { $in: args._ids } });
    }

    if (args.action === 'tagObject') {
      await model.updateMany(
        { _id: { $in: args.targetIds } },
        { $set: { tagIds: args.tagIds } },
        { multi: true }
      );

      data = await model.find({ _id: { $in: args.targetIds } }).lean();
    }

    return {
      status: 'success',
      data,
    };
  });

  consumeRPCQueue(
    'inbox:rpc_queue:getConversation',
    async ({ conversationId }) => ({
      status: 'success',
      data: await Conversations.findOne({ _id: conversationId }),
    })
  );
  consumeRPCQueue('inbox:rpc_queue:getIntegration', async (data) => {
    const { _id, subdomain } = data;

    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Integrations.findOne({ _id }),
    };
  });

  consumeRPCQueue('inbox:rpc_queue:activityLog:collectItems', async (data) => ({
    data: await collectConversations(data),
    status: 'success',
  }));

  consumeRPCQueue('inbox:rpc_queue:updateConversationMessage', async (data) => {
    const { filter, updateDoc } = data;

    const updated = await ConversationMessages.updateOne(filter, {
      $set: updateDoc,
    });

    return {
      data: updated,
      status: 'success',
    };
  });

  consumeQueue('inbox:removeCustomersConversations', (customerIds) => {
    return Conversations.removeCustomersConversations(customerIds);
  });

  consumeRPCQueue('inbox:rpc_queue:logs:getSchemaLabels', async ({ type }) => ({
    status: 'success',
    data: getSchemaLabels(type, LOG_MAPPINGS),
  }));

  consumeRPCQueue(
    'inbox:rpc_queue:logs:getConversations',
    async ({ query }) => ({
      status: 'success',
      data: await Conversations.find(query).lean(),
    })
  );
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

export const sendProductCategoryRPCMessage = async (
  action,
  data
): Promise<any> => {
  return client.sendRPCMessage(`productCategories:rpc_queue:${action}`, data);
};

export const sendTagRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`tags:rpc_queue:${action}`, { data });
};

export const sendToLog = (channel: string, data) =>
  client.sendMessage(channel, data);

export const fetchSegment = (segment, options?) =>
  sendSegmentMessage('fetchSegment', { segment, options }, true);

export const sendSegmentMessage = async (action, data, isRPC?: boolean) => {
  if (!isRPC) {
    return sendMessage(`segments:${action}`, data);
  }

  if (!(await serviceDiscovery.isAvailable('segments'))) {
    throw new Error('Segments service is not available');
  }

  sendMessage(`segments:rpc_queue:${action}`, data);
};

export const findMongoDocuments = async (serviceName: string, data: any) => {
  if (!(await serviceDiscovery.isEnabled(serviceName))) {
    return [];
  }

  if (!(await serviceDiscovery.isAvailable(serviceName))) {
    throw new Error(`${serviceName} service is not available.`);
  }

  return client.sendRPCMessage(
    `${serviceName}:rpc_queue:findMongoDocuments`,
    data
  );
};

export default function() {
  return client;
}
