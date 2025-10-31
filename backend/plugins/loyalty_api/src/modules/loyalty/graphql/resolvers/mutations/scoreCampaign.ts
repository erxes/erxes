import { checkPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { IScoreCampaign } from '~/modules/loyalty/@types/scoreCampaigns';

const scoreCampaignMutations = {
  async scoreCampaignAdd(
    _root,
    doc: IScoreCampaign,
    { models, user }: IContext,
  ) {
    return await models.ScoreCampaigns.createScoreCampaign(doc, user);
  },
  async scoreCampaignUpdate(
    _root,
    { _id, ...doc }: { _id: string } & IScoreCampaign,
    { models, user }: IContext,
  ) {
    return await models.ScoreCampaigns.updateScoreCampaign(_id, doc, user);
  },
  async scoreCampaignRemove(
    _root,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) {
    return await models.ScoreCampaigns.removeScoreCampaign(_id, user);
  },

  async scoreCampaignsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models, user }: IContext,
  ) {
    return await models.ScoreCampaigns.removeScoreCampaigns(_ids, user);
  },

  async refundLoyaltyScore(
    _root,
    { ownerId, ownerType, targetId },
    { models }: IContext,
  ) {
    return await models.ScoreCampaigns.refundLoyaltyScore(
      targetId,
      ownerType,
      ownerId,
    );
  },
};

checkPermission(scoreCampaignMutations, 'scoreCampaignAdd', 'manageLoyalties');
checkPermission(
  scoreCampaignMutations,
  'scoreCampaignUpdate',
  'manageLoyalties',
);
checkPermission(
  scoreCampaignMutations,
  'scoreCampaignRemove',
  'manageLoyalties',
);

export default scoreCampaignMutations;
