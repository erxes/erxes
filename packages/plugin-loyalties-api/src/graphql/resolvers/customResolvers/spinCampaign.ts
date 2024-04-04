import { IContext } from '../../../connectionResolver';
import { ISpinCampaignDocument } from '../../../models/definitions/spinCampaigns';

export default {
  async spinsCount(
    spinCampaign: ISpinCampaignDocument,
    _args,
    { models }: IContext
  ) {
    return models.Spins.find({ campaignId: spinCampaign._id }).countDocuments();
  }
};
