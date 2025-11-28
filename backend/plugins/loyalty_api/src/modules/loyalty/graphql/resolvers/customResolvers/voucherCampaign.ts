import { IContext } from '~/connectionResolvers';
import { IVoucherCampaignDocument } from '~/modules/loyalty/@types/voucherCampaigns';

export default {
  async vouchersCount(
    voucherCampaign: IVoucherCampaignDocument,
    _args,
    { models }: IContext,
  ) {
    return models.Vouchers.find({
      campaignId: voucherCampaign._id,
    }).countDocuments();
  },
};
