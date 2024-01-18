import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { sendSms } from './utils';
import { afterMutationHandlers } from './aftermutations';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeRPCQueue, consumeQueue } = client;

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

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string },
) => {
  return sendMessage({
    client,
    ...args,
  });
};

export default function () {
  return client;
}
