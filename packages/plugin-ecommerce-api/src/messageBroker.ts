import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  ISendMessageArgs,
  ISendMessageArgsNoService,
} from '@erxes/api-utils/src/core';

export const initBroker = async () => {};

export const sendProductsMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'products',
    ...args,
  });
};
