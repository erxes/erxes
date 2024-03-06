import {
  MessageArgs,
  MessageArgsOmitService,
  sendMessage,
} from '@erxes/api-utils/src/core';

import { consumeRPCQueue } from '@erxes/api-utils/src/messageBroker';

import { generateModels } from './connectionResolver';

let client;

export const setupMessageConsumers = async (cl: any) => {
  client = cl;

  consumeRPCQueue('salary:find', async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: 'success',
      data: await models.Salaries.find(data),
    };
  });
};

export const sendCommonMessage = async (args: MessageArgs) => {
  return sendMessage({
    ...args,
  });
};

export const sendCoreMessage = async (
  args: MessageArgsOmitService,
): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export default function () {
  return client;
}
