
import { consumeQueue, consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';
import { Activities } from "./models";

export const setupMessageConsumers = async () => {
  consumeQueue('activity:send', async ({ data }) => {
    Activities.send(data);

    return {
      status: 'success',
    };
  });

  consumeRPCQueue('activity:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Activities.find({})
    };
  });
};
