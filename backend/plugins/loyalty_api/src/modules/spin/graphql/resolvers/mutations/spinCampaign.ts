import { IContext } from '~/connectionResolvers';
import { ISpinCampaign } from '~/modules/spin/@types/spinCampaign';

/* -------------------- mutations -------------------- */

export const spinCampaignMutations = {
  async createSpinCampaign(
    _parent: undefined,
    doc: ISpinCampaign,
    { models }: IContext,
  ) {
    return models.SpinCampaign.createSpinCampaign(doc);
  },

  async updateSpinCampaign(
    _parent: undefined,
    { _id, ...doc }: ISpinCampaign & { _id: string },
    { models }: IContext,
  ) {
    return models.SpinCampaign.updateSpinCampaign(_id, doc);
  },

  async removeSpinCampaigns(
    _parent: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.SpinCampaign.removeSpinCampaigns(_ids);
  },
};


export default spinCampaignMutations;
