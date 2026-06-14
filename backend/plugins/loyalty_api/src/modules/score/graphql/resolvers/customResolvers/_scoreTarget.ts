import { sendTRPCMessage } from 'erxes-api-shared/utils';

interface TargetActionConfig {
  pluginName: string;
  module: string;
  action: string;
  fields: string[];
}

const TARGET_ACTIONS: Record<string, TargetActionConfig> = {
  pos: {
    pluginName: 'sales',
    module: 'orders',
    action: 'findOne',
    fields: ['items', 'number', 'totalAmount'],
  },
  sales: {
    pluginName: 'sales',
    module: 'deal',
    action: 'findOne',
    fields: ['productsData', 'number'],
  },
};

export const fetchScoreTarget = async ({
  targetId,
  serviceName,
  subdomain,
}: {
  targetId?: string;
  serviceName?: string;
  subdomain: string;
}) => {
  if (!targetId || !serviceName) return null;

  const config = TARGET_ACTIONS[serviceName];
  if (!config) return null;

  const response = await sendTRPCMessage({
    subdomain,
    pluginName: config.pluginName,
    method: 'query',
    module: config.module,
    action: config.action,
    input: { _id: targetId },
  });

  if (!response) return null;

  return Object.fromEntries(
    config.fields.map((field) => [field, response[field]]),
  );
};
