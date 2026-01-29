import { ISpinCampaignDocument } from '~/modules/spin/@types/spinCampaign';
import { IContext } from '~/connectionResolvers';

export default {
  async spinsCount(
    spinCampaign: ISpinCampaignDocument,
    _args: unknown,
    { models }: IContext,
  ) {
    return models.Spin.countDocuments({
      campaignId: spinCampaign._id,
    });
  },
};
