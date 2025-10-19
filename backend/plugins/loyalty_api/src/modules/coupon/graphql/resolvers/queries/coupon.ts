
  import { IContext } from '~/connectionResolvers';

   export const couponQueries = {
    getCoupon: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Coupon.getCoupon(_id);
    },
    
    getCoupons: async (_parent: undefined, { models }: IContext) => {
      return models.Coupon.getCoupons();
    },
  };
