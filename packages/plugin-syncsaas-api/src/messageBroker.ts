import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { afterMutationHandlers } from './afterMutations';
let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue } = client;

  consumeQueue('syncsaas:afterMutation', async ({ subdomain, data }) => {
    try {
      await afterMutationHandlers(subdomain, data);
      return;
    } catch (e) {
      console.log('Error in after mutation handler', e);
    }
  });
};

export const sendContactsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'contacts',
    ...args
  });
};

export const sendFormsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'forms',
    ...args
  });
};

export const sendCardsMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args
  });
};

export const sendCoreMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args
  });
};

export const sendCPMessage = (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'clientportal',
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

export default function() {
  return client;
}
