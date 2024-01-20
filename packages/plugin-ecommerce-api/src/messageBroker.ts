import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

let client;

export const initBroker = async (cl) => {
  client = cl;
};

export const sendProductsMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'products',
    ...args,
  });
};

export default function () {
  return client;
}
