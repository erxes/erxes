import { IScoreLog } from '@/score/@types/scoreLog';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const TARGET_ACTIONS: Record<
  string,
  { module: string; action: string; fields: string[] }
> = {
  pos: {
    module: 'orders',
    action: 'findOne',
    fields: ['items', 'number', 'totalAmount'],
  },
  sales: {
    module: 'deals',
    action: 'findOne',
    fields: ['productsData', 'number'],
  },
};

const fetchTarget = async ({
  targetId,
  module,
  subdomain,
}: {
  targetId: string;
  module: string;
  subdomain: string;
}) => {
  const config = TARGET_ACTIONS[module];

  if (!targetId || !config) {
    return null;
  }

  const target = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: config.module,
    action: config.action,
    input: {
      query: { _id: targetId },
    },
  });

  if (!target) {
    return null;
  }

  return Object.fromEntries(
    config.fields.map((field) => [field, target[field]]),
  );
};

export default {
  async campaign(
    { campaignId }: IScoreLog,
    _args: undefined,
    { models }: IContext,
  ) {
    return await models.ScoreCampaigns.findOne({ _id: campaignId });
  },

  type({ serviceName }: IScoreLog) {
    return serviceName || null;
  },

  async target(
    { targetId, serviceName }: IScoreLog,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    if (!targetId || !serviceName) {
      return null;
    }

    return await fetchTarget({
      targetId,
      module: serviceName,
      subdomain,
    });
  },
};
