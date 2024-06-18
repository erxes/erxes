
import { consumeQueue, consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';
import {
  MessageArgsOmitService,
  sendMessage,
} from '@erxes/api-utils/src/core';

export const setupMessageConsumers = async () => {
  consumeQueue('burenscoring:send', async ({ data }) => {
   
    return {
      status: 'success',
    };
  });

  consumeRPCQueue('burenscoring:find', async ({ data }) => {
    return {
      status: 'success'
    };
  });
};

export const getBurenScoringConfig = async (
  name: string,
  subdomain: string
) => {
  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfigs',
    data: {},
    isRPC: true,
    defaultValue: [],
  });

  return configs[name];
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};