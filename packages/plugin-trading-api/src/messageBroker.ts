import { init as initBrokerCore } from '@erxes/api-utils/src/messageBroker';
import { generateModels } from './connectionResolver';
let client;
export const initBroker = async options => {
  client = await initBrokerCore(options);
  const { consumeQueue, consumeRPCQueue } = client;
  consumeRPCQueue('', async ({}) => {});
};

export default function() {
  return client;
}
