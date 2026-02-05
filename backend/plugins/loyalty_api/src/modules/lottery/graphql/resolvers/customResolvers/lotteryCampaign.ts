import { ILotteryCampaignDocument } from '@/lottery/@types/lotteryCampaign';
import { IContext } from '~/connectionResolvers';

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
