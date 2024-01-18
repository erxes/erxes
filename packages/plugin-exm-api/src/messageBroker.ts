import { sendMessage, ISendMessageArgs } from '@erxes/api-utils/src/core';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';



export let client;

export const initBroker = async cl => {
  client = cl;
};

export const sendRPCMessage = async (message): Promise<any> => {
  return client.sendRPCMessage('rpc_queue:api_to_integrations', message);
};

export const updateConversationMessage = async (data: any) => {
  if (!(await isEnabled('inbox'))) {
    return null;
  }

  return client.sendRPCMessage(
    'inbox:rpc_queue.updateConversationMessage',
    data
  );
};

export const removeEngageConversations = async (_id): Promise<any> => {
  return client.consumeQueue('removeEngageConversations', _id);
};

export const getCampaignCustomerInfo = async data => {
  return client.sendRPCMessage(
    'contacts:rpc_queue.prepareEngageCustomers',
    data
  );
};

export default function() {
  return client;
}

export const sendContactsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'contacts',
    ...args
  });
};

export const sendInternalNotesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'internalNotes',
    ...args
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args
  });
};

export const sendFormsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'forms',
    ...args
  });
};

export const sendEngagesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'engages',
    ...args
  });
};

export const sendInboxMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'inbox',
    ...args
  });
};

export const sendProductsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'products',
    ...args
  });
};

export const sendNotificationsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'notifications',
    ...args
  });
};

export const sendLogsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'logs',
    ...args
  });
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'segments',
    ...args
  });
};
