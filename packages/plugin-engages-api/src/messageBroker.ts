import { sendMessage, ISendMessageArgs } from '@erxes/api-utils/src/core';

import { serviceDiscovery } from './configs';
import { generateModels } from './connectionResolver';

export let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('engage:removeCustomersEngages', async ({ data: { customerIds }, subdomain }) => {
    const models = await generateModels(subdomain);

    await models.EngageMessages.removeCustomersEngages(customerIds);
  });

  consumeQueue('engage:changeCustomer', async ({ data: { customerId, customerIds }, subdomain }) => {
    const models = await generateModels(subdomain);

    await models.EngageMessages.changeCustomer(customerId, customerIds);
  });

  consumeRPCQueue('engages:createVisitorOrCustomerMessages', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.EngageMessages.createVisitorOrCustomerMessages(data)
    }
  });
};

export const sendRPCMessage = async (message): Promise<any> => {
  return client.sendRPCMessage('rpc_queue:api_to_integrations', message);
};

export const createConversationAndMessage = async (doc): Promise<any> => {
  if(!(await serviceDiscovery.isEnabled('inbox'))) {
    return null;
  }

  if(!(await serviceDiscovery.isAvailable("inbox"))) {
    throw new Error(`Inbox service is not available`);
  }

  return client.sendRPCMessage('inbox:rpc_queue:createConversationAndMessage', doc);
};

export const updateConversationMessage = async (data: any) => {
  if(!(await serviceDiscovery.isEnabled('inbox'))) {
    return null;
  }

  if(!(await serviceDiscovery.isAvailable("inbox"))) {
    throw new Error(`Inbox service is not available`);
  }

  return client.sendRPCMessage('inbox:rpc_queue:updateConversationMessage', data);
};

export const removeEngageConversations = async (_id): Promise<any> => {
  return client.consumeQueue('removeEngageConversations', _id);
};

export const getCampaignCustomerInfo = async (data) => {
  return client.sendRPCMessage('contacts:rpc_queue:prepareEngageCustomers', data);
};

export default function() {
  return client;
}

export const sendContactsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'contacts', ...args });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'core', ...args });
};

export const sendInboxMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'inbox', ...args });
};

export const sendLogsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'logs', ...args });
};

export const sendSegmentsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'segments', ...args });
};

export const sendTagsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({ client, serviceDiscovery, serviceName: 'tags', ...args });
};
