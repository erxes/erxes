import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage,
} from '@erxes/api-utils/src/core';
import { sendSms } from './utils';
import { afterMutationHandlers } from './aftermutations';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  // consumeQueue('mobinet:send', async ({ data }) => {
  //   Mobinets.send(data);

  //   return {
  //     status: 'success'
  //   };
  // });

  consumeQueue('mobinet:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeRPCQueue('mobinet:sendSms', async ({ data }) => {
    const { phoneNumber, content } = data;

    console.log('*************** mobinet:sendSms', data);
    try {
      await sendSms(phoneNumber, content);
      return {
        status: 'success',
      };
    } catch (e) {
      console.log('*************** mobinet:sendSms error', e);
      return {
        status: 'error',
        message: e.message,
      };
    }
  });
};

export const sendCommonMessage = async (args: MessageArgs) => {
  return sendMessage({
    ...args,
  });
};
