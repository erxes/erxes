import { IContext } from '../../../connectionResolver';
import { ICodeConfig } from '../../../models/definitions/common';
import { CODE_STATUS } from '../../../models/definitions/constants';

const voucherCodesMutations = {
  async checkVoucherCode(
    _root,
    doc: { code: string; ownerId: string },
    { models }: IContext,
  ) {
    return models.VoucherCodes.checkVoucherCode(doc);
  },
  async redeemVoucherCode(
    _root,
    {
      code,
      ownerId,
      ownerType,
    }: { code: string; ownerId: string; ownerType: string },
    { models }: IContext,
  ) {
    const isValid = await models.VoucherCodes.checkVoucherCode({
      code,
      ownerId,
    });

    if (!isValid) {
      return { success: false, message: 'Invalid voucher code' };
    }

    const voucherCode = await models.VoucherCodes.findOne({ code });

    if (!voucherCode) {
      return { success: false, message: 'Voucher not found' };
    }

    const usageCount = voucherCode.usageCount + 1;
    const status =
      usageCount >= voucherCode.usageLimit
        ? CODE_STATUS.DONE
        : CODE_STATUS.LOSS;
    const usedBy = [
      ...voucherCode.usedBy,
      { usedAt: new Date(), ownerId, ownerType },
    ];

    await models.VoucherCodes.updateOne(
      { code },
      {
        $set: {
          usageCount,
          status,
          usedBy,
        },
      },
    );

    return { success: true, message: 'Voucher redeemed successfully' };
  },
  async generateVoucherCodes(_root, doc: ICodeConfig, { models }: IContext) {
    return models.VoucherCodes.generateVoucherCodes(doc);
  },
};

export default voucherCodesMutations;
