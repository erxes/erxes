import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { Polarissyncs } from './models';
import { afterMutationHandlers } from './afterMutations';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('polarissync:send', async ({ data }) => {
    Polarissyncs.send(data);

    return {
      status: 'success'
    };
  });

  consumeQueue('polarissync:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeRPCQueue('polarissync:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Polarissyncs.find({})
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
