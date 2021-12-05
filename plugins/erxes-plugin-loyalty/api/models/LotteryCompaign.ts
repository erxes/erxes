import { attachmentSchema } from './LoyaltyConfig';

const lotteryAward = {
  _id: { pkey: true },
  voucherCompaignId: { type: String },
  count: { type: Number, min: 0 }
}

export const lotteryCompaignSchema = {
  _id: { pkey: true },
  createdAt: { type: Date, label: 'Created at' },
  createdBy: { type: String, label: 'Created by' },
  modifiedAt: { type: Date, label: 'Modified at' },
  modifiedBy: { type: String, label: 'Modified by' },

  title: { type: String, label: 'Title' },
  description: { type: String, label: 'Description' },
  startDate: { type: Date, label: 'Start Date' },
  endDate: { type: Date, label: 'End Date' },
  lotteryDate: { type: Date, label: 'Lottery Date' },
  attachment: { type: attachmentSchema },

  numberFormat: { type: String },
  byScore: { type: Number },

  awards: { type: [lotteryAward] }
};

export class LotteryCompaign {
  public static async getLottery(models, _id: string) {
    const lotteryRule = await models.LotteryCompaign.findOne({ _id });

    if (!lotteryRule) {
      throw new Error('not found lottery rule')
    }

    return lotteryRule;
  }
}
