import { IDonateCampaignDocument } from '@/donate/@types/donateCampaign';
import { IContext } from '~/connectionResolvers';

export default {
  async donatesCount(
    { _id }: IDonateCampaignDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Donates.find({
      campaignId: _id,
    }).countDocuments();
  },
};
