import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';

export const initBroker = async () => {};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
