import { IContext } from '../../../connectionResolver';
import { IVoucherCampaignDocument } from '../../../models/definitions/voucherCampaigns';

export default {
  async vouchersCount(
    voucherCampaign: IVoucherCampaignDocument,
    _args,
    { models }: IContext
  ) {
    return models.Vouchers.find({
      campaignId: voucherCampaign._id
    }).countDocuments();
  }
};
