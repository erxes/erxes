import { sendMessage } from '@erxes/api-utils/src/core';
import type { MessageArgs } from '@erxes/api-utils/src/core';
import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  await initBrokerCore();
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
