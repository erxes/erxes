let client;

export const initBroker = cl => {
  client = cl;
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

export const sendToLog = (channel: string, data) =>
  client.sendMessage(channel, data);

export default function() {
  return client;
}
