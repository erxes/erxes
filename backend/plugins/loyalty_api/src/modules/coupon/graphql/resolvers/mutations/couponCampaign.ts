import { IContext } from '~/connectionResolvers';
import { ICouponCampaign } from '~/modules/coupon/@types/couponCampaign';

export const couponCampaignMutations = {
  createCouponCampaign: async (
    _parent: undefined,
    doc: ICouponCampaign,
    { models, user }: IContext,
  ) => {
    return models.CouponCampaign.createCouponCampaign(doc, user);
  },

  updateCouponCampaign: async (
    _parent: undefined,
    { _id, ...doc }: { _id: string } & ICouponCampaign,
    { models, user }: IContext,
  ) => {
    return models.CouponCampaign.updateCouponCampaign(_id, doc, user);
  },

  removeCouponCampaign: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.CouponCampaign.removeCouponCampaigns([_id]);
  },
};
