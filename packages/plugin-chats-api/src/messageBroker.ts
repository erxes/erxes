import {
  ISendMessageArgs,
  ISendMessageArgsNoService,
  sendMessage,
} from '@erxes/api-utils/src/core';

export const initBroker = async () => {};

export const sendCoreMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendInternalNotesMessage = async (
  args: ISendMessageArgsNoService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'internalnotes',
    ...args,
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
