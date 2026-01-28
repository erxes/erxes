import { IContext } from '~/connectionResolvers';
import { ILotteryCampaignDocument } from '~/modules/lottery/@types/lotteryCampaign';

export default {
  async lotteriesCount(
    lotteryCampaign: ILotteryCampaignDocument,
    _args,
    { models }: IContext
  ) {
    return models.Lottery.find({
      campaignId: lotteryCampaign._id
    }).countDocuments();
  }
};
