import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
  client = cl;

  // const { consumeQueue, consumeRPCQueue } = client;

  // consumeQueue('mobinet:send', async ({ data }) => {
  //   Mobinets.send(data);

  //   return {
  //     status: 'success'
  //   };
  // });

  // consumeRPCQueue('mobinet:find', async ({ data }) => {
  //   return {
  //     status: 'success',
  //     data: await Mobinets.find({})
  //   };
  // });
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
