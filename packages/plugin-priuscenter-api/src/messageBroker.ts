import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { Ads } from './models';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('ad:send', async ({ data }) => {
    Ads.send(data);

    return {
      status: 'success'
    };
  });

  consumeRPCQueue('ad:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Ads.find({})
    };
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
