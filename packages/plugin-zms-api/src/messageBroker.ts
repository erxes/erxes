import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

import { Zmss } from './models';

let client;

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue, consumeRPCQueue } = client;

  consumeQueue('zms:send', async ({ data }) => {
    Zmss.send(data);

    return {
      status: 'success'
    };
  });

  consumeRPCQueue('zms:find', async ({ data }) => {
    return {
      status: 'success',
      data: await Zmss.find({})
    };
  });
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    client,
    ...args
  });
};

export const getConfig = async (
  code: string,
  subdomain: string,
  defaultValue?: string
) => {
  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfigs',
    data: {},
    isRPC: true,
    defaultValue: []
  });

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'core',
    ...args
  });
};
export default function() {
  return client;
}
