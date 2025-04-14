import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { ICouponInput } from '../../../models/definitions/coupons';

const couponMutations = {
  couponAdd: async (_root, doc: ICouponInput, { models }: IContext) => {
    return await models.Coupons.createCoupon(doc);
  },

  couponEdit: async (
    _root,
    { _id, ...doc }: ICouponInput & { _id: string },
    { models }: IContext,
  ) => {
    return await models.Coupons.updateCoupon(_id, doc);
  },

  couponsRemove: async (
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) => {
    return models.Coupons.removeCoupons(_ids);
  },
};

checkPermission(couponMutations, 'couponAdd', 'manageLoyalties');
checkPermission(couponMutations, 'couponEdit', 'manageLoyalties');
checkPermission(couponMutations, 'couponsRemove', 'manageLoyalties');

export default couponMutations;
