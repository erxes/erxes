import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { sendToWebhook as sendWebhook } from '@erxes/api-utils/src';

let client;

export const initBroker = async (cl) => {
  client = cl;
};

export const sendContactsMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendInternalNotesMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'internalNotes',
    ...args,
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendFormsMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'forms',
    ...args,
  });
};

export const sendEngagesMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'engages',
    ...args,
  });
};

export const sendInboxMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'inbox',
    ...args,
  });
};

export const sendProductsMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'products',
    ...args,
  });
};

export const sendNotificationsMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'notifications',
    ...args,
  });
};

export const sendLogsMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'logs',
    ...args,
  });
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'segments',
    ...args,
  });
};

export const sendLoyaltiesMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'loyalties',
    ...args,
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string },
): Promise<any> => {
  return sendMessage({
    ...args,
  });
};

export const fetchSegment = (subdomain: string, segmentId: string, options?) =>
  sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: { segmentId, options },
    isRPC: true,
  });

export const sendToWebhook = ({ subdomain, data }) => {
  return sendWebhook(client, { subdomain, data });
};

export default function () {
  return client;
}
