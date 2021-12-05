const VOUCHER_STATUS = {
  NEW: 'new',
  LOSS: 'used',
  ALL: ['new', 'used']
}

export const voucherSchema = {
  _id: { pkey: true },
  VoucherCompaignId: { type: String, label: 'Voucher Compaign' },
  customerId: { type: String, label: 'Customer' },
  companyId: { type: String, label: 'Company' },
  userId: { type: String, label: 'Team member' },

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
}