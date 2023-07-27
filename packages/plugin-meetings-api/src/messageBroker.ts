import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IModels } from './connectionResolver';

let client;

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const initBroker = async cl => {
  client = cl;
};

export const sendCommonMessage = async (
  args: ISendMessageArgs & { serviceName: string }
) => {
  return sendMessage({
    serviceDiscovery,
    client,
    ...args
  });
};

export default function() {
  return client;
}
