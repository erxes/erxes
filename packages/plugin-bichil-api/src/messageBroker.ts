import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { Bichils } from './models';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('bichil:send', async ({ data }) => {
    Bichils.send(data);

    return {
      status: 'success'
    };
  });

  consumeRPCQueue('bichil:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Bichils.find({})
    };
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
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
