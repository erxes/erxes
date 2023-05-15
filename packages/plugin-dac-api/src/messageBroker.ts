import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

import { afterMutationHandlers } from './aftermutations';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async cl => {
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
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args
  });
};

export const sendCoreMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'core',
    ...args
  });
};
export const sendFormsMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'forms',
    ...args
  });
};
export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export const sendCarsMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'cars',
    ...args
  });
};

export const sendClientPortalMessage = (args: ISendMessageArgs) => {
  return sendMessage({
    serviceDiscovery,
    client,
    serviceName: 'clientportal',
    ...args
  });
};

export default function() {
  return client;
}
