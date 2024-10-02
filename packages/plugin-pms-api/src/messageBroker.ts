
import { consumeQueue, consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';
import { Pmss } from "./models";

export const setupMessageConsumers = async () => {
  consumeQueue('pms:send', async ({ data }) => {
    Pmss.send(data);

    return {
      status: 'success',
    };
  });

  consumeRPCQueue('pms:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Pmss.find({})
    };
  });
};
