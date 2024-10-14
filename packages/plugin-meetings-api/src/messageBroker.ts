import { sendMessage } from '@erxes/api-utils/src/core';
import { MessageArgs, MessageArgsOmitService } from '@erxes/api-utils/src/core';

import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IModels } from './connectionResolver';

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const setupMessageConsumers = async () => {};

export const sendCommonMessage = async (
  args: MessageArgs & { serviceName: string },
) => {
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
