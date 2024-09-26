
import { consumeQueue, consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';

export const setupMessageConsumers = async () => {
  consumeQueue('cms:send', async ({ data }) => {


    return {
      status: 'success',
    };
  });

  consumeRPCQueue('cms:find', async ({ data }) => {
    return {
      status: 'success',
      // data: await Cmss.find({})
    };
  });
};
