import { IScoreLog } from '@/score/@types/scoreLog';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils/getOwner';
import { fetchScoreTarget } from './_scoreTarget';

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
    return await fetchScoreTarget({ targetId, serviceName, subdomain });
  },
};
