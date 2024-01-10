import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { Syncpolariss } from './models';
import { afterMutationHandlers } from './afterMutations';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('syncerkhet:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });

  consumeQueue('syncpolaris:send', async ({ data }) => {
    Syncpolariss.send(data);

    return {
      status: 'success'
    };
  });

  consumeRPCQueue('syncpolaris:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Syncpolariss.find({})
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
