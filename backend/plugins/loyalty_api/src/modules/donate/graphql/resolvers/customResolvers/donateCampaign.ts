import { IContext } from '~/connectionResolvers';
import { IDonateCampaignDocument } from '@/donate/@types/donateCampaign';

export const donateCampaignResolvers = {
  donatesCount: async (
    donateCampaign: IDonateCampaignDocument,
    _parent: undefined,
    { models }: IContext,
  ) => {
    return models.Donate.countDocuments({
      campaignId: donateCampaign._id,
    });
  },
};
