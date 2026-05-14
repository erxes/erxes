import { IDonateCampaign } from '@/donate/@types/donateCampaign';
import { IContext } from '~/connectionResolvers';

export const donateCampaignMutations = {
  async donateCampaignsAdd(
    _parent: undefined,
    doc: IDonateCampaign,
    { models, user }: IContext,
  ) {
    return models.DonateCampaigns.createDonateCampaign(doc, user._id);
  },

  async donateCampaignsEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & IDonateCampaign,
    { models }: IContext,
  ) {
    return models.DonateCampaigns.updateDonateCampaign(_id, doc);
  },

  async donateCampaignsRemove(
    _parent: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.DonateCampaigns.removeDonateCampaigns(_ids);
  },
};
