import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { sendSms } from './utils';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeRPCQueue } = client;

  // consumeQueue('mobinet:send', async ({ data }) => {
  //   Mobinets.send(data);

  //   return {
  //     status: 'success'
  //   };
  // });

  consumeRPCQueue('mobinet:sendSms', async ({ data }) => {
    const { phoneNumber, content } = data;

    console.log('*************** mobinet:sendSms', data);
    try {
      await sendSms(phoneNumber, content);
      return {
        status: 'success'
      };
    } catch (e) {
      console.log('*************** mobinet:sendSms error', e);
      return {
        status: 'error',
        message: e.message
      };
    }
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
