import { IContext } from '~/connectionResolvers';
import { ILotteryCampaignDocument } from '~/modules/loyalty/@types/lotteryCampaigns';

export default {
  async lotteriesCount(
    lotteryCampaign: ILotteryCampaignDocument,
    _args,
    { models }: IContext,
  ) {
    return models.Lotteries.find({
      campaignId: lotteryCampaign._id,
    }).countDocuments();
  },
};
