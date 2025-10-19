
  import { IContext } from '~/connectionResolvers';

  export const voucherMutations = {
    createVoucher: async (_parent: undefined, { name }, { models }: IContext) => {
      return models.Voucher.createVoucher({name});
    },

    updateVoucher: async (_parent: undefined, { _id, name }, { models }: IContext) => {
      return models.Voucher.updateVoucher(_id, {name});
    },

    removeVoucher: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Voucher.removeVoucher(_id);
    },
  };

