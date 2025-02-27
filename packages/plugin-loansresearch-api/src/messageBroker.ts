import { sendMessage } from '@erxes/api-utils/src/core';
import type {
  MessageArgsOmitService,
  MessageArgs,
} from '@erxes/api-utils/src/core';
import { consumeQueue } from '@erxes/api-utils/src/messageBroker';
import { afterMutationHandlers } from './afterMutations';

export const setupMessageConsumers = async () => {
  consumeQueue('loansresearch:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendSalesMessage = async (
  args: MessageArgsOmitService
): Promise<any> => {
  return sendMessage({
    serviceName: 'sales',
    ...args,
  });
};

export const sendCommonMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    ...args,
  });
};
