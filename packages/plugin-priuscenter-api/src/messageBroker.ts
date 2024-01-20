import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage,
} from '@erxes/api-utils/src/core';
import { Ads } from './models';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  consumeQueue('ad:send', async ({ data }) => {
    Ads.send(data);

    return {
      status: 'success',
    };
  });

  consumeRPCQueue('ad:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Ads.find({}),
    };
  });
};

export const sendCommonMessage = async (args: MessageArgs) => {
  return sendMessage({
    ...args,
  });
};
