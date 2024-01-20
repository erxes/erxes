import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

export const initBroker = async () => {};

export const sendCommonMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
