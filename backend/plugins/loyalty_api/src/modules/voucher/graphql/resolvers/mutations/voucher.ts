import { IVoucher } from '@/voucher/@types/voucher';
import { IContext } from '~/connectionResolvers';
import { IBuyParams } from '~/utils';

export const voucherMutations = {
  async vouchersAdd(_root: undefined, doc: IVoucher, { models }: IContext) {
    return models.Vouchers.createVoucher(doc);
  },

  async vouchersAddMany(_root: undefined, doc: IVoucher, { models }: IContext) {
    return models.Vouchers.createVouchers(doc);
  },

  async vouchersEdit(
    _root: undefined,
    { _id, ...doc }: IVoucher & { _id: string },
    { models, user }: IContext,
  ) {
    return models.Vouchers.updateVoucher(_id, { ...doc, userId: user._id });
  },

  async vouchersRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Vouchers.removeVouchers(_ids);
  },

  async buyVoucher(_root: undefined, param: IBuyParams, { models }: IContext) {
    return models.Vouchers.buyVoucher(param);
  },
};
