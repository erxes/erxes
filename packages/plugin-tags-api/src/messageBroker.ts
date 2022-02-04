let client;

export const initBroker = async cl => {
  client = cl;
};

export const sendRPCMessage = async (channel, message): Promise<any> => {
  return client.sendRPCMessage(channel, message);
};