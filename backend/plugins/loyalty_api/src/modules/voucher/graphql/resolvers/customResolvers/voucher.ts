import { IVoucherDocument } from '@/voucher/@types/voucher';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';
import { voucherExpiresAt, voucherTerms } from '@/voucher/services/voucherTerm';

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

  async terms(
    voucher: IVoucherDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (voucher.terms) {
      return voucher.terms;
    }

    const campaign = await models.VoucherCampaigns.findOne({
      _id: voucher.campaignId,
    }).lean();

    return campaign ? voucherTerms(voucher, campaign) : null;
  },

  async expiresAt(
    voucher: IVoucherDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    const campaign = await models.VoucherCampaigns.findOne({
      _id: voucher.campaignId,
    }).lean();

    return campaign ? voucherExpiresAt(voucher, campaign) || null : null;
  },
};
