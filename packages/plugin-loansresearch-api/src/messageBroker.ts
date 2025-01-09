import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgsOmitService,
  MessageArgs,
} from '@erxes/api-utils/src/core';

export const setupMessageConsumers = async () => {};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
