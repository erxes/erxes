import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
let client;

export const initBroker = (cl) => {
  client = cl;
};

export const sendContactsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args,
  });
  //`contacts:rpc_queue:${action}`, data);
};
export const sendCardsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceDiscovery,
    serviceName: 'contacts',
    ...args,
  });
  //`cards:rpc_queue:${action}`, data);
};

export default function() {
  return client;
}
