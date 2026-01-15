import { IContext } from '~/connectionResolvers';
import { ICampaign } from '~/modules/campaign/@types';

export const campaignMutations = {
  createCampaign: async (
    _parent: undefined,
    doc: ICampaign,
    { models, user }: IContext,
  ) => {
    return models.Campaign.createCampaign(doc, user);
  },

  updateCampaign: async (
    _parent: undefined,
    { _id, ...doc }: { _id: string } & ICampaign,
    { models, user }: IContext,
  ) => {
    return models.Campaign.updateCampaign(_id, doc, user);
  },

  removeCampaign: async (
    _parent: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) => {
    return models.Campaign.removeCampaign(_ids);
  },
};
