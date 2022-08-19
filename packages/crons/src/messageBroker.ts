import { sendMessage } from '@erxes/api-utils/src/core';
import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';
import * as serviceDiscovery from './serviceDiscovery';

let client;

export const initBroker = async options => {
  client = await initBrokerCore(options);

  return client;
};

interface IISendMessageArgs {
  subdomain: string;
  action: string;
  data;
  isRPC?: boolean;
  defaultValue?;
  serviceName: string;
}

export const sendCommonMessage = async (
  args: IISendMessageArgs
): Promise<any> => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
