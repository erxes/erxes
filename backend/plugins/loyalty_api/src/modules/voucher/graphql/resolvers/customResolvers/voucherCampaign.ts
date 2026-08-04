import { IVoucherCampaignDocument } from '@/voucher/@types/voucherCampaign';
import { IContext } from '~/connectionResolvers';

export default {
  async vouchersCount(
    { _id }: IVoucherCampaignDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Vouchers.find({
      campaignId: _id,
    }).countDocuments();
  },
};
