import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { afterMutationHandlers } from './aftermutations';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeQueue } = client;

  consumeQueue('dac:afterMutation', async ({ data }) => {
    try {
      await afterMutationHandlers(data);
      return;
    } catch (e) {
      console.log('Error in after mutation handler', e);
    }
  });
};

export const sendContactsMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendCoreMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};
export const sendFormsMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    serviceName: 'forms',
    ...args,
  });
};
export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string },
): Promise<any> => {
  return sendMessage({
    ...args,
  });
};

export const sendCarsMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    serviceName: 'cars',
    ...args,
  });
};

export const sendClientPortalMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    serviceName: 'clientportal',
    ...args,
  });
};

export default function () {
  return client;
}
