
export const donateCompaignSchema = {
  _id: { pkey: true },
  donateCompaignId: { type: String },
  customerId: { type: String, label: 'Customer' },
  companyId: { type: String, label: 'Company' },
  userId: { type: String, label: 'Team member' },

  createdAt: { type: Date, label: 'Created at' },

  donateScore: { type: Number },
  voucherCompaignId: { type: String, label: 'Won Voucher Compaign', optional: true },
  voucherId: { type: String, label: 'Won Voucher', optional: true }
};

export class DonateCompaign {
  public static async getDonate(models, _id: string) {
    const donateRule = await models.DonateCompaigns.findOne({ _id });

    if (!donateRule) {
      throw new Error('not found donate rule')
    }

    return donateRule;
  }
}