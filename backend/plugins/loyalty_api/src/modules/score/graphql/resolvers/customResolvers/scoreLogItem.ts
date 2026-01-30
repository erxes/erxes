import { IContext } from '~/connectionResolvers';
import { IScoreLog } from '@/score/@types/scoreLog';
import { sendTRPCMessage } from 'erxes-api-shared/utils';


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

/* -------------------- helpers -------------------- */

const fetchTarget = async ({
  targetId,
  serviceName,
  subdomain,
}: {
  targetId: string;
  serviceName: string;
  subdomain: string;
}) => {
  const config = TARGET_ACTIONS[serviceName];

  if (!targetId || !config) {
    return null;
  }

  const target = await sendTRPCMessage({
    subdomain,
    pluginName: serviceName,
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

/* -------------------- resolvers -------------------- */

export default {
  async campaign(
    scoreLog: IScoreLog,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.ScoreCampaign.findOne({
      _id: scoreLog.campaignId,
    });
  },

  type(scoreLog: IScoreLog) {
    return scoreLog.serviceName ?? null;
  },

  async target(
    scoreLog: IScoreLog,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    if (!scoreLog.targetId || !scoreLog.serviceName) {
      return null;
    }

    return fetchTarget({
      targetId: scoreLog.targetId,
      serviceName: scoreLog.serviceName,
      subdomain,
    });
  },
};
