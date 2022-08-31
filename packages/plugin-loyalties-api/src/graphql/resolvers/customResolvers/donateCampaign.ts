import { IContext } from '../../../connectionResolver';
import { IDonateCampaignDocument } from '../../../models/definitions/donateCampaigns';

export default {
  async donatesCount(
    donateCampaign: IDonateCampaignDocument,
    _args,
    { models }: IContext
  ) {
    return models.Donates.find({
      campaignId: donateCampaign._id
    }).countDocuments();
  }
};
