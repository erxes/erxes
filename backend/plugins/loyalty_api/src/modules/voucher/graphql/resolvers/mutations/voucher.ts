import { IContext } from '~/connectionResolvers';
import { IVoucher } from '~/modules/voucher/@types/voucher';

export const voucherMutations = {
  createVoucher: async (
    _parent: undefined,
    doc: IVoucher,
    { models, user }: IContext,
  ) => {
    return models.Voucher.createVoucher(doc, user);
  },

  updateVoucher: async (
    _parent: undefined,
    { _id, ...doc }: { _id: string } & IVoucher,
    { models, user }: IContext,
  ) => {
    return models.Voucher.updateVoucher(_id, doc, user);
  },

  removeVoucher: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Voucher.removeVoucher(_id);
  },
};
