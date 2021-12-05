import { attachmentSchema } from "./LoyaltyConfig";

export const voucherCompaignSchema = {
  _id: { pkey: true },
  createdAt: { type: Date, label: 'Created at' },
  createdBy: { type: String, label: 'Created by' },
  modifiedAt: { type: Date, label: 'Modified at' },
  modifiedBy: { type: String, label: 'Modified by' },
  title: { type: String, label: 'Title' },
  description: { type: String, label: 'Description' },
  startDate: { type: Date, label: 'Start Date' },
  endDate: { type: Date, label: 'End Date' },
  attachment: { type: attachmentSchema },

  score: { type: Number },
  scoreAction: { type: String },

  productId: { type: String },
  productDiscountPercent: { type: Number },

  spinId: { type: String },
  spinCount: { type: Number },

  lotteryId: {type: String},
  lotteryCount: { type: Number },
};

export class VoucherCompaign {
  public static async getVoucher(models, _id: string) {
    const voucherRule = await models.VoucherCompaign.findOne({ _id });

    if (!voucherRule) {
      throw new Error('not found voucher rule')
    }

    return voucherRule;
  }
}