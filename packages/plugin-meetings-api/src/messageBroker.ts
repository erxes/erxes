import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';

import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IModels } from './connectionResolver';

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const initBroker = async () => {};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string },
) => {
  return sendMessage({
    ...args,
  });
};

export const sendCoreMessage = async (args: ISendMessageArgs): Promise<any> => {
  return sendMessage({
    serviceName: 'core',
    ...args,
  });
};

export const sendCardsMessage = async (
  args: ISendMessageArgs,
): Promise<any> => {
  return sendMessage({
    serviceName: 'cards',
    ...args,
  });
};
