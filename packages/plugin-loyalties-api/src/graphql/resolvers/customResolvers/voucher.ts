import { IContext } from '../../../connectionResolver';
import { IVoucherDocument } from '../../../models/definitions/vouchers';
import { getOwner } from '../../../models/utils';

export default {
  async owner(voucher: IVoucherDocument, _args, { subdomain }: IContext) {
    return getOwner(subdomain, voucher.ownerType, voucher.ownerId);
  },
  async campaign(voucher: IVoucherDocument, _args, { models }: IContext) {
    return models.VoucherCampaigns.findOne({ _id: voucher.campaignId }).lean();
  }
};
