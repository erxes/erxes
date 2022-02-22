import { generateFieldsFromSchema } from "@erxes/api-utils/src";
import { ConversationMessages, Conversations, Integrations } from "./models";
import { receiveRpcMessage } from "./receiveMessage";

let client;

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
    content
  });

  // create message
  return ConversationMessages.createMessage({
    engageData,
    conversationId: conversation._id,
    userId,
    customerId,
    visitorId,
    content
  });
};

export const generateFields = async args => {
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
        ...(await generateFieldsFromSchema(path.schema, `${name}.`))
      ];
    }
  }

  return fields;
};

export const initBroker = (cl) => {
  client = cl;
 
  const { consumeQueue, consumeRPCQueue } = client;

  consumeRPCQueue(
    'rpc_queue:engagePluginApi_to_api',
    async (
      userId,
      status,
      customerId,
      visitorId,
      integrationId,
      content,
      engageData
    ) => {
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
    async data => await receiveRpcMessage(data)
  );

  consumeRPCQueue(
    'inbox:rpc_queue:findIntegrations',
    async ({ query, options }) => {
      const integrations = await Integrations.findIntegrations(
        query,
        options
      );

      return { data: integrations, status: 'success' };
    }
  );

  consumeQueue('inbox:removeCustomersConversations', async customerIds => {
    await Conversations.removeCustomersConversations(customerIds);
  });

  consumeQueue('inbox:changeCustomer', async (customerId, customerIds) => {
    await Conversations.changeCustomer(customerId, customerIds);
  });

  consumeRPCQueue('inbox:rpc_queue:getFields', async args => ({
    status: 'success',
    data: await generateFields(args)
  }));

  consumeRPCQueue('inbox:rpc_queue:tag', async args => {
    let data = {};

    if (args.action === 'count') {
      data = await Conversations.countDocuments({ tagIds: { $in: args._ids } });
    }

    if (args.action === 'tagObject') {
      await Conversations.updateMany(
        { _id: { $in: args.targetIds } },
        { $set: { tagIds: args.tagIds } },
        { multi: true }
      );

      data = await Conversations.find({ _id: { $in: args.targetIds } }).lean();
    }

    return {
      status: 'success',
      data
    }
  });
};

export const sendCardMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`cards:rpc_queue:${action}`, data);
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

export const sendCoreMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`core:rpc_queue:${action}`, data);
};

export const sendConformityMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`conformities:${action}`, data);
};

export const sendEngageMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`engages:rpc_queue:${action}`, data);
};

export const sendToLog = (channel: string, data) =>
  client.sendMessage(channel, data);

export const fetchSegment = (segment, options?) =>
  sendRPCMessage("rpc_queue:fetchSegment", {
    segment,
    options,
  });

export default function() {
  return client;
}

