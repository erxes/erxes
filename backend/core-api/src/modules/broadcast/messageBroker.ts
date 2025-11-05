import { MessageArgsOmitService, sendMessage } from './core';

export const sendCoreMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendInboxMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'inbox',
    ...args,
  });
};

export const sendClientPortalMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: 'clientportal',
    ...args,
  });
};
