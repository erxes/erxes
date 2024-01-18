import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

let client;

export const initBroker = async cl => {
  client = cl;
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    ...args
  });
};

export default function() {
  return client;
}
