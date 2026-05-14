import { ISpinCampaignDocument } from '@/spin/@types/spinCampaign';
import { IContext } from '~/connectionResolvers';

export default {
  async spinsCount(
    { _id }: ISpinCampaignDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Spins.find({ campaignId: _id }).countDocuments();
  },
};
