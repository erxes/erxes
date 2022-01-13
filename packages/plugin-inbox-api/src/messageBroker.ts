import * as dotenv from 'dotenv';
import messageBroker from 'erxes-message-broker';

dotenv.config();

let client;

export const initBroker = async server => {
  client = await messageBroker({
    name: 'inbox',
    server,
    envs: process.env
  });
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

export const sendToLog = (channel: string, data) =>
  client.sendMessage(channel, data);

export default function() {
  return client;
}
