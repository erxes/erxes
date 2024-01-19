import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';


let client;

export const initBroker = async cl => {
  client = cl;
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    client,
    ...args
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'core',
    ...args
  });
};

export const sendNotificationsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'notifications',
    ...args
  });
};

export default function() {
  return client;
}
