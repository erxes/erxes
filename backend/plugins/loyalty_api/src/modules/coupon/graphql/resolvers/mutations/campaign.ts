import { IContext } from '~/connectionResolvers';
import { ICouponCampaign } from '~/modules/coupon/@types/campaign';

export const couponCampaignMutations = {
  couponCampaignAdd: async (
    _root: undefined,
    doc: ICouponCampaign,
    { models, user }: IContext,
  ) => {
    return await models.CouponCampaign.createCampaign(doc, user);
  },

  couponCampaignEdit: async (
    _root: undefined,
    { _id, ...doc }: ICouponCampaign & { _id: string },
    { models, user }: IContext,
  ) => {
    return await models.CouponCampaign.updateCampaign(_id, doc, user);
  },

  couponCampaignsRemove: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.CouponCampaign.removeCampaign(_id);
  },
};
