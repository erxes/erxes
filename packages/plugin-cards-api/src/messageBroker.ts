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

export const sendFormRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`forms:rpc_queue:${action}`, data);
};

export const sendFormMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`forms:${action}`, data);
};

export const sendChecklistMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`checklists:${action}`, data);
};

export const sendChecklistRPCMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`checklists:rpc_queue:${action}`, data);
};

export const sendInternalNoteMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`internalNotes:${action}`, data);
};

export const sendConformityMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`conformities:${action}`, data);
};

export const sendConformityRPCMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`conformities:rpc_queue:${action}`, data);
};

export const sendFieldsGroupMessage = async (action, data): Promise<any> => {
  return client.sendMessage(`fieldsGroups:${action}`, data);
};

export const sendEngageRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`engages:rpc_queue:${action}`, data);
};

export const sendFieldRPCMessage = async (action, data): Promise<any> => {
  return client.sendRPCMessage(`fields:rpc_queue:${action}`, data);
};

export const sendNotificationRPCMessage = async (
  action,
  data
): Promise<any> => {
  return client.sendRPCMessage(`notifications:rpc_queue:${action}`, data);
};

export const sendToLog = (channel: string, data) =>
  client.sendMessage(channel, data);

export default function() {
  return client;
}
