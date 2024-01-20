import { MessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { IContext as IMainContext } from '@erxes/api-utils/src';

import { IModels } from './connectionResolver';
import { afterMutationHandlers } from './afterMutations';

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const initBroker = async () => {
  consumeQueue('msdynamic:afterMutation', async ({ subdomain, data }) => {
    await afterMutationHandlers(subdomain, data);
    return;
  });
};

export const sendContactsMessage = async (args: MessageArgs) => {
  return sendMessage({
    serviceName: 'contacts',
    ...args,
  });
};

export const sendProductsMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'products',
    ...args,
  });
};

export const sendCoreMessage = async (args: MessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string },
) => {
  return sendMessage({
    ...args,
  });
};
