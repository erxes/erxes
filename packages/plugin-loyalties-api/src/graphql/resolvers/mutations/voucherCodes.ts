import { IContext } from '../../../connectionResolver';
import { ICodeConfig } from '../../../models/definitions/common';

const voucherCodesMutations = {
  async checkVoucherCode(
    _root,
    doc: { code: string; ownerId: string },
    { models }: IContext,
  ) {
    return models.VoucherCodes.checkVoucherCode(doc);
  },
  async generateVoucherCodes(_root, doc: ICodeConfig, { models }: IContext) {
    return models.VoucherCodes.generateVoucherCodes(doc);
  },
};

export default voucherCodesMutations;
