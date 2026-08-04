import { IScoreCampaign } from '@/score/@types/scoreCampaign';
import { IContext } from '~/connectionResolvers';

export const scoreCampaignMutations = {
  async scoreCampaignAdd(
    _root: undefined,
    doc: IScoreCampaign,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignCreate');
    return await models.ScoreCampaigns.createScoreCampaign(doc, user);
  },

  async scoreCampaignUpdate(
    _root: undefined,
    { _id, ...doc }: { _id: string } & IScoreCampaign,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignUpdate');
    return await models.ScoreCampaigns.updateScoreCampaign(_id, doc, user);
  },

  async scoreCampaignRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignRemove');
    return await models.ScoreCampaigns.removeScoreCampaign(_id, user);
  },

  async scoreCampaignsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignRemove');
    return await models.ScoreCampaigns.removeScoreCampaigns(_ids, user);
  },

  async refundLoyaltyScore(
    _root: undefined,
    {
      ownerId,
      ownerType,
      targetId,
    }: { ownerId: string; ownerType: string; targetId: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('scoreRefund');
    return await models.ScoreCampaigns.refundLoyaltyScore(
      targetId,
      ownerType,
      ownerId,
    );
  },
};