import { ISpinCampaign } from '@/spin/@types/spinCampaign';
import { IContext } from '~/connectionResolvers';

export const spinCampaignMutations = {
  async spinCampaignsAdd(
    _root: undefined,
    doc: ISpinCampaign,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignCreate');
    return models.SpinCampaigns.createSpinCampaign(doc);
  },

  async spinCampaignsEdit(
    _root: undefined,
    { _id, ...doc }: ISpinCampaign & { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignUpdate');
    return models.SpinCampaigns.updateSpinCampaign(_id, doc);
  },

  async spinCampaignsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignRemove');
    return models.SpinCampaigns.removeSpinCampaigns(_ids);
  },
};

export default spinCampaignMutations;