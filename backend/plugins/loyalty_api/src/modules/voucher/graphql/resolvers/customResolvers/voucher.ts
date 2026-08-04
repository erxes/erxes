import { IVoucherDocument } from '@/voucher/@types/voucher';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';

export default {
  async __resolveReference({ _id }, _args: undefined, { models }: IContext) {
    return models.Vouchers.findOne({ _id }).lean();
  },

  async owner(
    { ownerType, ownerId }: IVoucherDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return getLoyaltyOwner(subdomain, {
      ownerType,
      ownerId,
    });
  },

  async campaign(
    { campaignId }: IVoucherDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.VoucherCampaigns.findOne({ _id: campaignId }).lean();
  },
};
