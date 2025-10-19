
  import { IContext } from '~/connectionResolvers';

  export const couponMutations = {
    createCoupon: async (_parent: undefined, { name }, { models }: IContext) => {
      return models.Coupon.createCoupon({name});
    },

    updateCoupon: async (_parent: undefined, { _id, name }, { models }: IContext) => {
      return models.Coupon.updateCoupon(_id, {name});
    },

    removeCoupon: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Coupon.removeCoupon(_id);
    },
  };

