import { Tags } from "./models";

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('tags:rpc_queue:find', async (selector) => ({
    data: await Tags.find(selector).lean(),
    status: 'success',
  }));
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};