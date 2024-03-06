import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';

export const setupMessageConsumers = async () => {};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
