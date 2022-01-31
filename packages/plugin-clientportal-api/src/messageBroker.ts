import { generateFieldsFromSchema } from '@erxes/api-utils/src';

let client;

export const initBroker = (cl) => {
  client = cl;
};

export const sendContactsMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`contacts:rpc_queue:${action}`, data);
};
export const sendCardsMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`cards:rpc_queue:${action}`, data);
};

export default function() {
  return client;
}
