import { IScoreLog } from '@/score/@types/scoreLog';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils/getOwner';

const TARGET_ACTIONS: Record<
  string,
  { module: string; action: string; fields: string[] }
> = {
  pos: {
    module: 'order',
    action: 'findOne',
    fields: ['items', 'number', 'totalAmount'],
  },
  sales: {
    module: 'deal',
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

  const response = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: config.module,
    action: config.action,
    input: {
      _id: targetId,
    },
  });

  if (!response) {
    return null;
  }

  return Object.fromEntries(
    config.fields.map((field) => [field, response[field]]),
  );
};

export default {
  async owner(
    { ownerType, ownerId, owner }: IScoreLog & { owner?: any },
    _args: undefined,
    { subdomain }: IContext,
  ) {
    if (owner) return owner;
    return getLoyaltyOwner(subdomain, { ownerType, ownerId });
  },

  change({ change, changeScore }: any) {
    return change ?? changeScore ?? null;
  },

  async campaign(
    { campaignId, campaign }: any,
    _args: undefined,
    { models }: IContext,
  ) {
    if (campaign) return campaign;
    if (!campaignId) return null;
    return await models.ScoreCampaigns.findOne({ _id: campaignId });
  },

  async target(
    { targetId, serviceName, target }: any,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    if (target) return target;
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
