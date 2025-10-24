import { IContext } from '~/connectionResolvers';
import { IVoucherDocument } from '~/modules/loyalty/@types/vouchers';
import { getOwner } from '~/modules/loyalty/db/models/utils';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Vouchers.findOne({ _id }).lean();
  },
  async owner(voucher: IVoucherDocument, _args, { subdomain }: IContext) {
    return getOwner(subdomain, voucher.ownerType, voucher.ownerId);
  },
  async campaign(voucher: IVoucherDocument, _args, { models }: IContext) {
    return models.VoucherCampaigns.findOne({ _id: voucher.campaignId }).lean();
  },
};
