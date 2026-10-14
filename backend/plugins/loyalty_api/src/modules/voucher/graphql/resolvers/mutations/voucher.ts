import { IVoucher, IVoucherParams } from '@/voucher/@types/voucher';
import { IContext } from '~/connectionResolvers';
import { IBuyParams } from '~/utils';

export const voucherMutations = {
  async vouchersAdd(
    _root: undefined,
    doc: IVoucher,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('voucherCreate');
    return models.Vouchers.createVoucher({ ...doc, userId: user?._id });
  },

  async vouchersAddMany(_root: undefined, doc: IVoucher, { models, checkPermission }: IContext) {
    await checkPermission('voucherCreate');
    return models.Vouchers.createVouchers(doc);
  },

  async vouchersEdit(
    _root: undefined,
    { _id, ...doc }: IVoucher & { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('voucherEdit');
    return models.Vouchers.updateVoucher(_id, { ...doc, userId: user._id });
  },

  async vouchersRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('voucherRemove');
    return models.Vouchers.removeVouchers(_ids);
  },

  async vouchersRemoveByFilter(
    _root: undefined,
    params: IVoucherParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('voucherRemove');
    return models.Vouchers.removeVouchersByFilter(params);
  },

  // An issued voucher is only ever used, cancelled or extended, never edited.
  async voucherCancel(
    _root: undefined,
    { _id, reason }: { _id: string; reason: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('voucherEdit');
    return models.Vouchers.cancelVoucher({ _id, reason, userId: user._id });
  },

  async voucherMarkUsed(
    _root: undefined,
    { _id, note }: { _id: string; note: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('voucherEdit');
    return models.Vouchers.markVoucherUsed({ _id, note, userId: user._id });
  },

  async voucherExtend(
    _root: undefined,
    { _id, endDate }: { _id: string; endDate: Date },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('voucherEdit');
    return models.Vouchers.extendVoucher({ _id, endDate, userId: user._id });
  },

  async buyVoucher(_root: undefined, param: IBuyParams, { models, checkPermission }: IContext) {
    await checkPermission('voucherBuy');
    return models.Vouchers.buyVoucher(param);
  },
};