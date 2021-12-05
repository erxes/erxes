import { attachmentSchema } from './LoyaltyConfig';

const donateAward = {
  _id: { pkey: true },
  minScore: { type: Number },
  voucherCompaignId: { type: String },
}

export const donateCompaignSchema = {
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

  awards: { type: [donateAward] },
  maxScore: { type: Number },
};

export class DonateCompaign {
  public static async getDonate(models, _id: string) {
    const donateRule = await models.DonateCompaign.findOne({ _id });

    if (!donateRule) {
      throw new Error('not found donate rule')
    }

    return donateRule;
  }
}