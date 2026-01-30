import { IContext } from '~/connectionResolvers';
import { IVoucherCampaignDocument } from '~/modules/voucher/@types/voucherCampaign';

export default {
  async vouchersCount(
    voucherCampaign: IVoucherCampaignDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Voucher.countDocuments({
      campaignId: voucherCampaign._id,
    });
  },
};
