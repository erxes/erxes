import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  ISendMessageArgs,
  ISendMessageArgsNoService,
} from '@erxes/api-utils/src/core';

export const initBroker = async () => {};

export const sendCommonMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    ...args,
  });
};

export const sendCoreMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendNotificationsMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'notifications',
    ...args,
  });
};
