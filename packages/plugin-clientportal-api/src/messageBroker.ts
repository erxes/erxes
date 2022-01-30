import { generateFieldsFromSchema } from '@erxes/api-utils/src';

let client;

export const initBroker = (cl) => {
  client = cl;
};

export const sendContactsMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`contacts:rpc_queue${action}`, data);
};
export const sendCardsMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`cards:rpc_queue${action}`, data);
};

export default function() {
  return client;
}
