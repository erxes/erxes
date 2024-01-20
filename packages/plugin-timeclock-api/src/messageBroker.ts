import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';

export const initBroker = async () => {};

export const sendCoreMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendFormsMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'forms',
    ...args,
  });
};

export const sendNotificationsMessage = async (
  args: MessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'notifications',
    ...args,
  });
};
