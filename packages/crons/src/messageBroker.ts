import { sendMessage } from '@erxes/api-utils/src/core';
import type { ISendMessageArgs } from '@erxes/api-utils/src/core';
import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  await initBrokerCore();
};

export const sendCommonMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
