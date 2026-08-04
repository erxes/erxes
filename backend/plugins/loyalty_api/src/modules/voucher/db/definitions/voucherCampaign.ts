import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { commonCampaignSchema } from '~/utils';

export const voucherCampaignSchema = schemaWrapper(
  new Schema(
    {
      ...commonCampaignSchema,

      buyScore: { type: Number, label: 'Buy score' },

      score: { type: Number, label: 'Score' },
      scoreAction: { type: String, label: 'Score action' },

      voucherType: { type: String, label: 'Voucher type' },

      productCategoryIds: { type: [String], label: 'Product category ids' },
      productIds: { type: [String], label: 'Product ids' },
      discountPercent: { type: Number, label: 'Discount percent' },

      bonusProductId: { type: String, label: 'Bonus product id' },
      bonusCount: { type: Number, optional: true, label: 'Bonus count' },

      coupon: { type: String, label: 'Coupon' },

      spinCampaignId: { type: String, label: 'Spin campaign id' },
      spinCount: { type: Number, label: 'Spin count' },

      lotteryCampaignId: { type: String, label: 'Lottery campaign id' },
      lotteryCount: { type: Number, label: 'Lottery count' },

      kind: {
        type: String,
        enum: ['amount', 'percent'],
        required: true,
      },
      value: {
        type: Number,
        required: true,
        min: 0,
      },

      restrictions: {
        type: Schema.Types.Mixed,
      },
    },
    {
      timestamps: true,
    },
  ),
);
