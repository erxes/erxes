import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('insurance:send', async ({ data }) => {
    return {
      status: 'success',
    };
  });

  consumeRPCQueue('insurance:find', async ({ data }) => {
    return {
      status: 'success',
      data: [],
    };
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string },
) => {
  return sendMessage({
    ...args,
  });
};

export default function () {
  return client;
}
