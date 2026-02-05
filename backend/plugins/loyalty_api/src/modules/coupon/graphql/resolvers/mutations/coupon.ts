import { ICouponInput } from '@/coupon/@types/coupon';
import { IContext } from '~/connectionResolvers';

export const couponMutations = {
  async couponAdd(_root: undefined, doc: ICouponInput, { models }: IContext) {
    return models.Coupons.createCoupon(doc);
  },

  async couponEdit(
    _root: undefined,
    { _id, ...doc }: ICouponInput & { _id: string },
    { models }: IContext,
  ) {
    return models.Coupons.updateCoupon(_id, doc);
  },

  async couponsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Coupons.removeCoupons(_ids);
  },
};
