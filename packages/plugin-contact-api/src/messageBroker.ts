import { generateFields } from "./utils";

let client;

export const initBroker = cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('contacts:rpc_queue:getFields', async args => ({
    status: 'success',
    data: await generateFields(args)
  }));

  consumeRPCQueue('contacts:segments:associationTypes', async ({ mainType }) => {
    let types: string[] = [];

    if (['customer', 'lead'].includes(mainType)) {
      types = ['company', 'deal', 'ticket', 'task'];
    }
  
    if (mainType === 'company') {
      types = ['customer', 'deal', 'ticket', 'task'];
    }

    return { data: { types }, status: 'success' };
  });

  consumeRPCQueue('contacts:segments:esTypesMap', async () => {
    return { data: { typesMap: {} }, status: 'success' };
  });

  consumeRPCQueue(
    'contacts:segments:initialSelector',
    async () => {
      const negative = {
        term: {
          status: 'deleted'
        }
      }

      return { data: { negative }, status: 'success' };
    }
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

export const savedConformity = async (doc): Promise<any> => {
  return client.sendRPCMessage('conformities:rpc_queue:savedConformity', doc);
};

export const prepareCustomFieldsData = async (doc): Promise<any> => {
  return client.sendRPCMessage('fields:rpc_queue:prepareCustomFieldsData', { doc });
};

export const findIntegrations = async (query, options?): Promise<any> => {
  return client.sendRPCMessage('rpc_queue:findIntegrations', { query, options });
};

export const sendToLog = (channel: string, data) =>
  client.sendMessage(channel, data);

export const removeCustomersConversations = async (
  customerIds
): Promise<any> => {
  await client.consumeQueue(
    'contact:removeCustomersConversations',
    customerIds
  );
};

export const removeCustomersEngages = async (customerIds): Promise<any> => {
  await client.consumeQueue('contact:removeCustomersEngages', customerIds);
};

export const changeCustomer = async (customerId, customerIds): Promise<any> => {
  await client.consumeQueue('contact:changeCustomer', customerId, customerIds);
};

export const engageChangeCustomer = async (
  customerId,
  customerIds
): Promise<any> => {
  await client.consumeQueue('engage:changeCustomer', customerId, customerIds);
};

export const fetchSegment = (segment, options?) =>
  sendRPCMessage("rpc_queue:fetchSegment", {
    segment,
    options,
  });

export default function() {
  return client;
}
