import { attachmentSchema } from './LoyaltyConfig';

const spinAward = {
  _id: { pkey: true },
  voucherCompaignId: { type: String },
  probability: { type: Number, max: 100, min: 0 }
}

export const spinCompaignSchema = {
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

  byScore: { type: Number },

  awards: { type: [spinAward] }
};

export class SpinCompaign {
  public static async getSpin(models, _id: string) {
    const spinRule = await models.SpinCompaign.findOne({ _id });

    if (!spinRule) {
      throw new Error('not found spin rule')
    }

    return spinRule;
  }
}