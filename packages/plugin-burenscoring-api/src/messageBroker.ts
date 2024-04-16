
import { consumeQueue, consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';

export const setupMessageConsumers = async () => {
  consumeQueue('burenscoring:send', async ({ data }) => {
   

    return {
      status: 'success',
    };
  });

  consumeRPCQueue('burenscoring:find', async ({ data }) => {
    return {
      status: 'success'
    };
  });
};
