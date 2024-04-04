import { IContext } from '../../../connectionResolver';
import { ILotteryCampaignDocument } from '../../../models/definitions/lotteryCampaigns';

export default {
  async lotteriesCount(
    lotteryCampaign: ILotteryCampaignDocument,
    _args,
    { models }: IContext
  ) {
    return models.Lotteries.find({
      campaignId: lotteryCampaign._id
    }).countDocuments();
  }
};
