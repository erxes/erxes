import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

import { afterMutationHandlers } from './afterMutations';
import { generateModels } from './connectionResolver';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('tumentech:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeRPCQueue('tumentech:topups.findOne', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return { status: 'success', data: await models.Topups.findOne(data) };
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args
  });
};

export const sendProductsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'products',
    ...args
  });
};

export const sendReactionsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'reactions',
    ...args
  });
};

export const sendXypMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'xyp',
    ...args
  });
};

export const sendInternalNotesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'internalnotes',
    ...args
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    ...args
  });
};

export const sendNotificationsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'notifications',
    ...args
  });
};

export const sendNotification = (subdomain: string, data) => {
  return sendNotificationsMessage({ subdomain, action: 'send', data });
};

export const sendContactsMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    serviceName: 'contacts',
    ...args
  });
};

export const sendCardsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args
  });
};

export const sendSegmentsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceName: 'segments',
    ...args
  });
};

export const fetchSegment = (
  subdomain: string,
  segmentId: string,
  options?,
  segmentData?: any
) =>
  sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: { segmentId, options, segmentData },
    isRPC: true
  });

export const sendClientPortalMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    serviceName: 'clientportal',
    ...args
  });
};

export const sendFormsMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    serviceName: 'forms',
    ...args
  });
};

export default function() {
  return client;
}
