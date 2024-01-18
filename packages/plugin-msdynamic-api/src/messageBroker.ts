import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { IContext as IMainContext } from '@erxes/api-utils/src';

import { IModels } from './connectionResolver';
import { afterMutationHandlers } from './afterMutations';

let client;

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const initBroker = async cl => {
  client = cl;

  const { consumeQueue } = client;

  consumeQueue('msdynamic:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });
};

export const sendContactsMessage = async (args: ISendMessageArgs) => {
  return sendMessage({
    client,
    serviceName: 'contacts',
    ...args
  });
};

export const sendProductsMessage = async (
  args: ISendMessageArgs
): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'products',
    ...args
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    client,
    serviceName: 'core',
    ...args
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

export default function() {
  return client;
}
