import { IContext } from '~/connectionResolvers';
import { ICoupon } from '~/modules/coupon/@types/coupon';

export const couponMutations = {
  createCoupon: async (
    _parent: undefined,
    doc: ICoupon,
    { models, user }: IContext,
  ) => {
    return models.Coupon.createCoupon(doc, user);
  },

  updateCoupon: async (
    _parent: undefined,
    { _id, ...doc }: { _id: string } & ICoupon,
    { models, user }: IContext,
  ) => {
    return models.Coupon.updateCoupon(_id, doc, user);
  },

  removeCoupon: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Coupon.removeCoupon(_id);
  },
};
