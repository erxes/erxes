import { MessageArgs, MessageArgsOmitService, sendMessage } from '@erxes/api-utils/src/core';
import { afterMutationHandlers } from './aftermutations';
import { consumeQueue } from '@erxes/api-utils/src/messageBroker';

export const initBroker = async () => {
  consumeQueue('dac:afterMutation', async ({ data }) => {
    try {
      await afterMutationHandlers(data);
      return;
    } catch (e) {
      console.log('Error in after mutation handler', e);
    }
  });
};

export const sendContactsMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: 'contacts',
    ...args
  });
};

export const sendCoreMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: 'core',
    ...args
  });
};
export const sendFormsMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: 'forms',
    ...args
  });
};
export const sendCommonMessage = async (
  args: MessageArgs
): Promise<any> => {
  return sendMessage({
    ...args
  });
};

export const sendCarsMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: 'cars',
    ...args
  });
};

export const sendClientPortalMessage = (args: MessageArgsOmitService) => {
  return sendMessage({
    serviceName: 'clientportal',
    ...args
  });
};
