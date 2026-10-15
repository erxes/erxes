import { ICouponDocument } from '@/coupon/@types/coupon';
import { IContext } from '~/connectionResolvers';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Coupons.findOne({ code: _id }).lean();
  },
  async campaign(
    coupon: ICouponDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.CouponCampaigns.findOne({ _id: coupon.campaignId }).lean();
  },
};
