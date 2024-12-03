import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';
import type { MessageArgsOmitService } from '@erxes/api-utils/src/core';
import { sendMessage } from '@erxes/api-utils/src/core';

export const setupMessageConsumers = async () => {
  consumeQueue('bm:send', async ({ data }) => {
    return {
      status: 'success',
    };
  });

  consumeRPCQueue('bm:find', async ({ data }) => {
    return {
      status: 'success',
      data: 'asd',
    };
  });
};

export const sendCoreMessage = (args: MessageArgsOmitService): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};
