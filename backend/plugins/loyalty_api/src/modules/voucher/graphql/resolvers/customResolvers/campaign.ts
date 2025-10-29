import { IContext } from '~/connectionResolvers';
import { IVoucherCampaignDocument } from '~/modules/voucher/@types/campaign';

export default {
  async __resolveReference(
    { _id }: IVoucherCampaignDocument,
    _: undefined,
    { models }: IContext,
  ) {
    return models.VoucherCampaign.findOne({ _id }).lean();
  },

  async voucherCount(
    { _id }: IVoucherCampaignDocument,
    _: undefined,
    { models }: IContext,
  ) {
    return models.Voucher.countDocuments({ campaignId: _id });
  },

  async createdBy({ createdBy }: IVoucherCampaignDocument) {
    return { __typename: 'User', _id: createdBy };
  },

  async updatedBy({ updatedBy }: IVoucherCampaignDocument) {
    return { __typename: 'User', _id: updatedBy };
  },
};
