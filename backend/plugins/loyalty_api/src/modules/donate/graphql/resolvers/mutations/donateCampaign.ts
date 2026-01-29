import { IContext } from '~/connectionResolvers';
import { IDonateCampaign } from '@/donate/@types/donateCampaign';

export const donateCampaignMutations = {
  createDonateCampaign: async (
    _parent: undefined,
    doc: IDonateCampaign,
    { models, user }: IContext,
  ) => {
    return models.DonateCampaign.createDonateCampaign(doc, user);
  },

  updateDonateCampaign: async (
    _parent: undefined,
    { _id, ...doc }: { _id: string } & IDonateCampaign,
    { models, user }: IContext,
  ) => {
    return models.DonateCampaign.updateDonateCampaign(_id, doc, user);
  },

  removeDonateCampaign: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.DonateCampaign.removeDonateCampaigns([_id]);
  },
};
