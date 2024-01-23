import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { Syncpolariss } from './models';
import { afterMutationHandlers } from './afterMutations';
import {
  consumeRPCQueue,
  consumeQueue,
} from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  consumeQueue('syncpolaris:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeQueue('syncpolaris:send', async ({ data }) => {
    Syncpolariss.send(data);

    return {
      status: 'success',
    };
  });

  consumeRPCQueue('syncpolaris:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Syncpolariss.find({}),
    };
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string },
) => {
  return sendMessage({
    ...args,
  });
};
