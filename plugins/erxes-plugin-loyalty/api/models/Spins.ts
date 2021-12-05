const SPIN_STATUS = {
  NEW: 'new',
  LOSS: 'loss',
  WON: 'won',
  ALL: ['new', 'loss', 'won']
}

export const spinSchema = {
  _id: { pkey: true },
  spinCompaignId: { type: String },
  customerId: { type: String, label: 'Customer' },
  companyId: { type: String, label: 'Company' },
  userId: { type: String, label: 'Team member' },

  createdAt: { type: Date, label: 'Created at' },

  status: { type: String, enum: SPIN_STATUS.ALL, default: 'new' },
  voucherCompaignId: { type: String, label: 'Won Voucher Compaign', optional: true },
  voucherId: { type: String, label: 'Won Voucher', optional: true }
};

export class Spin {
  public static async getSpin(models, _id: string) {
    const spinRule = await models.SpinCompaign.findOne({ _id });

    if (!spinRule) {
      throw new Error('not found spin rule')
    }

    return spinRule;
  }
}