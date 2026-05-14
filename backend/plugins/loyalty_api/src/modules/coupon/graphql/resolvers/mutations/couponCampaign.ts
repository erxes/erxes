import { ICouponCampaign } from '@/coupon/@types/couponCampaign';
import { IContext } from '~/connectionResolvers';

export const couponCampaignMutations = {
  async couponCampaignAdd(
    _root: undefined,
    doc: ICouponCampaign,
    { models, user }: IContext,
  ) {
    return models.CouponCampaigns.createCouponCampaign(doc, user);
  },

  async couponCampaignEdit(
    _root: undefined,
    { _id, ...doc }: ICouponCampaign & { _id: string },
    { models, user }: IContext,
  ) {
    return models.CouponCampaigns.updateCouponCampaign(_id, doc, user);
  },

  async couponCampaignsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.CouponCampaigns.removeCouponCampaigns(_ids);
  },
};
