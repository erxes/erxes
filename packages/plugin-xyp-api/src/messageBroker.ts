import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
// import { Xyps } from "./models";

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('xyp:send', async ({ data }) => {
    // Xyps.send(data);

    return {
      status: 'success'
    };
  });

  consumeRPCQueue('xyp:find', async ({ data }) => {
    return {
      status: 'success'
      // data: await Xyps.find({})
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
