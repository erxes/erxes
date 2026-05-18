import { IDonateCampaign } from '@/donate/@types/donateCampaign';
import { IContext } from '~/connectionResolvers';

export const donateCampaignMutations = {
  async donateCampaignsAdd(
    _parent: undefined,
    doc: IDonateCampaign,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignCreate');
    return models.DonateCampaigns.createDonateCampaign(doc, user._id);
  },

  async donateCampaignsEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & IDonateCampaign,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignUpdate');
    return models.DonateCampaigns.updateDonateCampaign(_id, doc);
  },

  async donateCampaignsRemove(
    _parent: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignRemove');
    return models.DonateCampaigns.removeDonateCampaigns(_ids);
  },
};