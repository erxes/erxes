import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';


let client;

export const initBroker = async cl => {
  client = cl;
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'core',
    ...args
  });
};

export const sendInternalNotesMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'internalnotes',
    ...args
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    client,
    ...args
  });
};

export default function() {
  return client;
}
