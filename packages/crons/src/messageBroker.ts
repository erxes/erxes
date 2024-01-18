import { sendMessage } from '@erxes/api-utils/src/core';
import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';

let client;

export const initBroker = async () => {
  client = await initBrokerCore();

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
  args: IISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    client,
    ...args,
  });
};

export default function () {
  return client;
}
