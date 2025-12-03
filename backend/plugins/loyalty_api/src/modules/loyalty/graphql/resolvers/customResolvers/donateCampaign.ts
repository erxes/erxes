import { IContext } from '~/connectionResolvers';
import { IDonateCampaignDocument } from '~/modules/loyalty/@types/donateCampaigns';

export default {
  async donatesCount(
    donateCampaign: IDonateCampaignDocument,
    _args,
    { models }: IContext,
  ) {
    return models.Donates.find({
      campaignId: donateCampaign._id,
    }).countDocuments();
  },
};
