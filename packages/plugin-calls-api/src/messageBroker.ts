import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { Callss } from './models';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('calls:send', async ({ data }) => {
    Callss.send(data);

    return {
      status: 'success'
    };
  });

  consumeRPCQueue('calls:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Callss.find({})
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
