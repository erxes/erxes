import { IScoreLog } from '@/score/@types/scoreLog';
import { getOwnerBalance } from '@/score/services/scoreLedger';
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
    {
      ownerType,
      ownerId,
      owner,
      campaignId,
      accountTypeId,
    }: IScoreLog & { owner?: any },
    _args: undefined,
    { subdomain, models }: IContext,
  ) {
    let lastOwner = owner;
    if (!lastOwner) {
      lastOwner = await getLoyaltyOwner(subdomain, { ownerType, ownerId });
    }

    // The wallet the entry wrote to; fixed points have no campaign to ask.
    const source = accountTypeId
      ? await models.LoyaltyAccountTypes.findOne({ _id: accountTypeId }).lean()
      : await models.ScoreCampaigns.findOne({ _id: campaignId }).lean();

    return getOwnerBalance({
      models,
      subdomain,
      ownerType,
      ownerId,
      fieldId: source?.fieldId,
      owner: lastOwner,
    });
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
