import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IBuyParams } from '../../../models/definitions/common';
import { IVoucher } from '../../../models/definitions/vouchers';

const vouchersMutations = {
  async vouchersAdd(_root, doc: IVoucher, { models }: IContext) {
    return models.Vouchers.createVoucher(doc);
  },

  async vouchersEdit(
    _root,
    { _id, ...doc }: IVoucher & { _id: string },
    { models, user }: IContext
  ) {
    return models.Vouchers.updateVoucher(_id, { ...doc, userId: user._id });
  },

  async vouchersRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) {
    return models.Vouchers.removeVouchers(_ids);
  },

  async buyVoucher(_root, param: IBuyParams, { models }: IContext) {
    return models.Vouchers.buyVoucher(param);
  }
};

checkPermission(vouchersMutations, 'vouchersAdd', 'manageLoyalties');
checkPermission(vouchersMutations, 'vouchersEdit', 'manageLoyalties');
checkPermission(vouchersMutations, 'vouchersRemove', 'manageLoyalties');

export default vouchersMutations;
