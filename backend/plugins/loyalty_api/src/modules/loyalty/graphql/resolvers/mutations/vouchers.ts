import { checkPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { IBuyParams } from '~/modules/loyalty/@types/common';
import { IVoucher } from '~/modules/loyalty/@types/vouchers';

const vouchersMutations = {
  async vouchersAdd(_root, doc: IVoucher, { models }: IContext) {
    return models.Vouchers.createVoucher(doc);
  },

  async vouchersAddMany(_root, doc: IVoucher, { models }: IContext) {
    return models.Vouchers.createVouchers(doc);
  },

  async vouchersEdit(
    _root,
    { _id, ...doc }: IVoucher & { _id: string },
    { models, user }: IContext,
  ) {
    return models.Vouchers.updateVoucher(_id, { ...doc, userId: user._id });
  },

  async vouchersRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Vouchers.removeVouchers(_ids);
  },

  async buyVoucher(_root, param: IBuyParams, { models }: IContext) {
    return models.Vouchers.buyVoucher(param);
  },
};

checkPermission(vouchersMutations, 'vouchersAdd', 'manageLoyalties');
checkPermission(vouchersMutations, 'vouchersAddMany', 'manageLoyalties');
checkPermission(vouchersMutations, 'vouchersEdit', 'manageLoyalties');
checkPermission(vouchersMutations, 'vouchersRemove', 'manageLoyalties');

export default vouchersMutations;
