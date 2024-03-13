import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage,
} from '@erxes/api-utils/src/core';
import {
  consumeQueue,
  consumeRPCQueue,
} from '@erxes/api-utils/src/messageBroker';

import { Zmss } from './models';

export const setupMessageConsumers = async () => {
  consumeQueue('zms:send', async ({ data }) => {
    Zmss.send(data);

    return {
      status: 'success',
    };
  });

  consumeRPCQueue('zms:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Zmss.find({}),
    };
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string },
) => {
  return sendMessage({
    ...args,
  });
};

export const getConfig = async (
  code: string,
  subdomain: string,
  defaultValue?: string,
) => {
  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfigs',
    data: {},
    isRPC: true,
    defaultValue: [],
  });

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};
