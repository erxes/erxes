import { changeScoreOwner, commonSchema } from './CompaignUtils';
import { VOUCHER_STATUS } from './Constants';

export const voucherSchema = {
  ...commonSchema,

  status: { type: String, enum: VOUCHER_STATUS.ALL, default: 'new', label: 'Status' },
};

export const voucherCompoundIndexes = {
  status: 1,
  customerId: 1
}

export class Voucher {
  public static async getVoucher(models, _id: string) {
    const voucherRule = await models.Voucher.findOne({ _id });

    if (!voucherRule) {
      throw new Error('not found voucher rule')
    }

    return voucherRule;
  }

  public static async createVoucher(models, { compaignId, ownerType, ownerId }) {
    const voucherCompaign = await models.VoucherCompaigns.getVoucherCompaign(models, compaignId);

    switch (voucherCompaign.voucherType) {
      case 'discount':
        return models.Vouchers.create({ compaignId, ownerType, ownerId, createdAt: new Date(), status: VOUCHER_STATUS.NEW });
      case 'bonus':
        return models.Vouchers.create({ compaignId, ownerType, ownerId, createdAt: new Date(), status: VOUCHER_STATUS.NEW });
      case 'spin':
        return models.Spins.createSpin(models, { compaignId: voucherCompaign.spinCompaignId, ownerType, ownerId });
      case 'lottery':
        return models.Lottery.createLottery(models, { compaignId: voucherCompaign.lotteryCompaignId, ownerType, ownerId });
      case 'score':
        return changeScoreOwner(models, { ownerType, ownerId, changeScore: voucherCompaign.score })
      default:
        break
    }
  }

  public static async buyVoucher(models, { compaignId, ownerType, ownerId, count = 1 }) {
    const voucherCompaign = await models.VoucherCompaigns.getVoucherCompaign(models, compaignId);

    if (!voucherCompaign.buyScore) {
      throw new Error('can not buy this voucher');
    }

    await changeScoreOwner(models, { ownerType, ownerId, changeScore: -1 * voucherCompaign.buyScore * count });

    return models.Vouchers.createVoucher(models, { compaignId, ownerType, ownerId });
  }
}
