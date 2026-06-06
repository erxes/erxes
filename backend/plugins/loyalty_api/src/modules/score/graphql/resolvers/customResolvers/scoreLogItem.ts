import { IScoreLog } from '@/score/@types/scoreLog';
import { IContext } from '~/connectionResolvers';
import { fetchScoreTarget } from './_scoreTarget';
import { getLoyaltyOwner } from '~/utils/getOwner';

export default {
  change({ changeScore }: any) {
    return changeScore ?? null;
  },

  async owner(
    { ownerType, ownerId, owner }: IScoreLog & { owner?: any },
    _args: undefined,
    { subdomain }: IContext,
  ) {
    if (owner) return owner;
    return getLoyaltyOwner(subdomain, { ownerType, ownerId });
  },

  async totalScore(
    { ownerType, ownerId, owner, campaignId }: IScoreLog & { owner?: any },
    _args: undefined,
    { subdomain, models }: IContext,
  ) {
    let lastOwner = owner;
    if (!lastOwner) {
      lastOwner = await getLoyaltyOwner(subdomain, { ownerType, ownerId });
    }

    const campaign = await models.ScoreCampaigns.findOne({ _id: campaignId }).lean();
    if (campaign?.fieldId) {
      return lastOwner?.propertiesData?.[campaign?.fieldId]
    }
    return 0;
  },

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
    return await fetchScoreTarget({ targetId, serviceName, subdomain });
  },
};
