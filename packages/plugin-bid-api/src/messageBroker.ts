import { MessageArgs, MessageArgsOmitService, sendMessage } from '@erxes/api-utils/src/core';
import { Polarissyncs } from './models';
import { afterMutationHandlers } from './afterMutations';
import { consumeQueue, consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {

  consumeQueue('bid:send', async ({ data }) => {
    Polarissyncs.send(data);

    return {
      status: 'success',
    };
  });

  consumeQueue('bid:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeRPCQueue('bid:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Polarissyncs.find({}),
    };
  });
};

export const sendCommonMessage = async (
  args: MessageArgs
) => {
  return sendMessage({
    ...args,
  });
};
