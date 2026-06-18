import { ICouponInput } from '@/coupon/@types/coupon';
import { IContext } from '~/connectionResolvers';

export const couponMutations = {
  async couponAdd(_root: undefined, doc: ICouponInput, { models, checkPermission }: IContext) {
    await checkPermission('couponCreate');
    return models.Coupons.createCoupon(doc);
  },

  async couponEdit(
    _root: undefined,
    { _id, ...doc }: ICouponInput & { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('couponEdit');
    return models.Coupons.updateCoupon(_id, doc);
  },

  async couponsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('couponRemove');
    return models.Coupons.removeCoupons(_ids);
  },
};