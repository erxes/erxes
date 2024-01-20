import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { afterMutationHandlers } from './afterMutations';

export const initBroker = async () => {
  consumeQueue('productplaces:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });
};

export const sendProductsMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'products',
    ...args,
  });
};

export const sendTagsMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'tags',
    ...args,
  });
};

export const sendContactsMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendCardsMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args,
  });
};

export const sendPricingMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'pricing',
    ...args,
  });
};

export const sendCoreMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendSegmentsMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'segments',
    ...args,
  });
};
