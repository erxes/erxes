import { generateModels } from './connectionResolver';
import { ISendMessageArgs, sendMessage } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from './configs';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeRPCQueue } = client;

};

export default function() {
  return client;
}
