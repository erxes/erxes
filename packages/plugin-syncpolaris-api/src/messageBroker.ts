import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { Syncpolariss } from './models';
import { afterMutationHandlers } from './afterMutations';
import {
  consumeRPCQueue,
  consumeQueue,
} from '@erxes/api-utils/src/messageBroker';
import { createLoanSchedule } from './utils/loan/createSchedule';

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

  consumeRPCQueue('syncpolaris:createSchedule', async ({ data, subdomain }) => {
    return {
      status: 'success',
      data: await createLoanSchedule(subdomain, data),
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
