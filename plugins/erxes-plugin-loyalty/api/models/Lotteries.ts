const LOTTERY_STATUS = {
  NEW: 'new',
  WON: 'won',
  ALL: ['new', 'won']
}

export const lotteryCompaignSchema = {
  _id: { pkey: true },
  lotteryCompaignId: {type: String},
  createdAt: { type: Date, label: 'Created at' },
  customerId: { type: String, label: 'Customer' },
  companyId: { type: String, label: 'Company' },
  userId: { type: String, label: 'Team member' },

  status: { type: String, enum: LOTTERY_STATUS.ALL, default: 'new' },

  voucherCompaignId: { type: String, label: 'Won Voucher Compaign', optional: true },
  voucherId: { type: String, label: 'Won Voucher', optional: true }
};

export class LotteryCompaign {
  public static async getLottery(models, _id: string) {
    const lotteryRule = await models.LotteryCompaigns.findOne({ _id });

    if (!lotteryRule) {
      throw new Error('not found lottery rule')
    }

    return lotteryRule;
  }
}
