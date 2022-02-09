import { Products } from "./models";

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('products:rpc_queue:findOne', async (selector) => ({
    data: await Products.findOne(selector),
    status: 'success',
  }));

  consumeRPCQueue('products:rpc_queue:find', async (selector) => ({
    data: await Products.find(selector),
    status: 'success',
  }));

  consumeRPCQueue('products:rpc_queue:update', async ({ selector, modifier }) => ({
    data: await Products.updateMany(selector, modifier),
    status: 'success',
  }));
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};

export const prepareCustomFieldsData = async (doc): Promise<any> => {
  return client.sendRPCMessage('fields:rpc_queue:prepareCustomFieldsData', {
    doc,
  });
};

export const findTags = async (selector): Promise<any> => {
  return client.sendRPCMessage('tags:rpc_queue:find', selector);
};

export const findCompanies = async (selector): Promise<any> => {
  return client.sendRPCMessage('contacts:rpc_queue:findActiveCompanies', selector);
};