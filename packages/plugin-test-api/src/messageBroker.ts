
import { sendMessage } from "@erxes/api-utils/src/core";
import type { MessageArgs } from "@erxes/api-utils/src/core";
import { consumeQueue, consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";

export const setupMessageConsumers = async () => {
  // consumeQueue('test:send', async ({ data }) => {
  //   Tests.send(data);

  //   return {
  //     status: 'success',
  //   };
  // });

  // consumeRPCQueue('test:find', async ({ data }) => {
  //   return {
  //     status: 'success',
  //     data: await Tests.find({})
  //   };
  // });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};