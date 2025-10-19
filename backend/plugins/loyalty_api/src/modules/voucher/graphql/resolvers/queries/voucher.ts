
  import { IContext } from '~/connectionResolvers';

   export const voucherQueries = {
    getVoucher: async (_parent: undefined, { _id }, { models }: IContext) => {
      return models.Voucher.getVoucher(_id);
    },
    
    getVouchers: async (_parent: undefined, { models }: IContext) => {
      return models.Voucher.getVouchers();
    },
  };
