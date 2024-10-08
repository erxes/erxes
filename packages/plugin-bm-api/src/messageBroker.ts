import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

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
