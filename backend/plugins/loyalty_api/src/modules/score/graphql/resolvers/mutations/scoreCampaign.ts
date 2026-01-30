import { IContext } from '~/connectionResolvers';
import { IScoreCampaign } from '@/score/@types/scoreCampaign';

export const scoreCampaignMutations = {
  createScoreCampaign: async (
    _parent: undefined,
    doc: IScoreCampaign,
    { models, user }: IContext,
  ) => {
    return models.ScoreCampaign.createScoreCampaign(doc, user);
  },

  updateScoreCampaign: async (
    _parent: undefined,
    { _id, ...doc }: { _id: string } & IScoreCampaign,
    { models, user }: IContext,
  ) => {
    return models.ScoreCampaign.updateScoreCampaign(_id, doc, user);
  },

  removeScoreCampaign: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.ScoreCampaign.removeScoreCampaign(_id);
  },

  removeScoreCampaigns: async (
    _parent: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) => {
    return models.ScoreCampaign.removeScoreCampaigns(_ids);
  },

  refundLoyaltyScore: async (
    _parent: undefined,
    {
      ownerId,
      ownerType,
      targetId,
    }: {
      ownerId: string;
      ownerType: string;
      targetId: string;
    },
    { models }: IContext,
  ) => {
    return models.ScoreCampaign.refundLoyaltyScore(
      targetId,
      ownerType,
      ownerId,
    );
  },
};
