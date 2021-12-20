import { OWNER_TYPES } from './Constants';
const VOUCHER_STATUS = {
  NEW: 'new',
  LOSS: 'used',
  ALL: ['new', 'used']
}

export const voucherSchema = {
  _id: { pkey: true },
  voucherCompaignId: { type: String, label: 'Voucher Compaign' },
  ownerType: { type: String, label: 'Owner Type', enum: OWNER_TYPES.ALL },
  ownerId: {type: String},

  createdAt: { type: Date, label: 'Created at' },

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

  public static async createVoucher(models, voucherCompaignId, ownerType, ownerId) {
    const voucherCompaign = await models.VoucherCompaigns.getVoucherCompaign(models, voucherCompaignId);

    switch (voucherCompaign.voucherType) {
      case 'discount':
        models.Vouchers.create({ voucherCompaignId, ownerType, ownerId })
        break;
      case 'bonus':
        break;
      case 'spin':
        break;
      case 'lottery':
        break;
      default:
        break
    }
  }
}
