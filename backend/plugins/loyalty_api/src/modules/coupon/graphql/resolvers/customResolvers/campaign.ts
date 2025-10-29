import { IContext } from '~/connectionResolvers';
import { ICouponCampaignDocument } from '~/modules/coupon/@types/campaign';

export default {
  async __resolveReference(
    { _id }: ICouponCampaignDocument,
    _: undefined,
    { models }: IContext,
  ) {
    return models.CouponCampaign.findOne({ _id }).lean();
  },

  async couponCount(
    { _id }: ICouponCampaignDocument,
    _: undefined,
    { models }: IContext,
  ) {
    return models.Coupon.countDocuments({ campaignId: _id });
  },

  async createdBy({ createdBy }: ICouponCampaignDocument) {
    return { __typename: 'User', _id: createdBy };
  },

  async updatedBy({ updatedBy }: ICouponCampaignDocument) {
    return { __typename: 'User', _id: updatedBy };
  },
};
