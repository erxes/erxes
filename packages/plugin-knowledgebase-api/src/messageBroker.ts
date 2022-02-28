import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';

import { LOG_MAPPINGS } from './constants';

let client;

export const initBroker = async (cl) => {
  client = cl;

  const { consumeRPCQueue } = client;

  consumeRPCQueue('knowledgebase:rpc_queue:logs:getSchemaLabels', async ({ type }) => ({
    status: 'success',
    data: getSchemaLabels(type, LOG_MAPPINGS)
  }));
}

export default function() {
  return client;
}
