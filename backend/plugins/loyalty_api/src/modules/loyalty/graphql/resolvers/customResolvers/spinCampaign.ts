import { IContext } from '~/connectionResolvers';
import { ISpinCampaignDocument } from '~/modules/loyalty/@types/spinCampaigns';

export default {
  async spinsCount(
    spinCampaign: ISpinCampaignDocument,
    _args,
    { models }: IContext,
  ) {
    return models.Spins.find({ campaignId: spinCampaign._id }).countDocuments();
  },
};
