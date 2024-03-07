import { sendMessage } from '@erxes/api-utils/src/core';
import type { MessageArgs } from '@erxes/api-utils/src/core';
import { connectToMessageBroker } from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  await connectToMessageBroker(setupMessageConsumers);
};

export const setupMessageConsumers = async () => {};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
