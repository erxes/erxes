import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage,
} from '@erxes/api-utils/src/core';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  consumeQueue('insurance:send', async ({ data }) => {
    return {
      status: 'success',
    };
  });

  consumeRPCQueue('insurance:find', async ({ data }) => {
    return {
      status: 'success',
      data: [],
    };
  });
};

export const sendCommonMessage = async (args: MessageArgs) => {
  return sendMessage({
    ...args,
  });
};
