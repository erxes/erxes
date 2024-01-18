
import { ISendMessageArgs, sendMessage } from "@erxes/api-utils/src/core";

import { {Name}s } from "./models";

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('{name}:send', async ({ data }) => {
    {Name}s.send(data);

    return {
      status: 'success',
    };
  });

  consumeRPCQueue('{name}:find', async ({ data }) => {
    return {
      status: 'success',
      data: await {Name}s.find({})
    };
  });
};


export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    client,
    ...args
  });
};

export default function() {
  return client;
}