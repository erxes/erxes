import { Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { LOYALTY_STATUSES } from '~/constants';

export const voucherCampaignSchema = schemaWrapper(
  new Schema(
    {
      /* -------------------- common campaign fields -------------------- */

      _id: { type: String },

      title: { type: String, label: 'Title' },
      description: { type: String, label: 'Description' },

      startDate: { type: Date, label: 'Start date' },
      endDate: { type: Date, label: 'End date' },
      finishDateOfUse: { type: Date, label: 'Finish date of use' },

      attachments: { type: [Schema.Types.Mixed], label: 'Attachments' },

      status: {
        type: String,
        enum: LOYALTY_STATUSES.ALL,
        default: LOYALTY_STATUSES.ACTIVE,
      },

      createdBy: { type: String, label: 'Created by' },
      updatedBy: { type: String, label: 'Updated by' },

      /* -------------------- voucher campaign fields -------------------- */

      buyScore: { type: Number, label: 'Buy score' },

      score: { type: Number, label: 'Score' },
      scoreAction: { type: String, label: 'Score action' },

      voucherType: { type: String, label: 'Voucher type' },

      productCategoryIds: {
        type: [String],
        label: 'Product category ids',
      },

      productIds: {
        type: [String],
        label: 'Product ids',
      },

      discountPercent: {
        type: Number,
        label: 'Discount percent',
      },

      bonusProductId: {
        type: String,
        label: 'Bonus product id',
      },

      bonusCount: {
        type: Number,
        label: 'Bonus count',
        optional: true,
      },

      coupon: {
        type: String,
        label: 'Coupon',
      },

      spinCampaignId: {
        type: String,
        label: 'Spin campaign id',
      },

      spinCount: {
        type: Number,
        label: 'Spin count',
      },

      lotteryCampaignId: {
        type: String,
        label: 'Lottery campaign id',
      },

      lotteryCount: {
        type: Number,
        label: 'Lottery count',
      },

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
        label: 'Restrictions',
      },
    },
    {
      timestamps: true,
    },
  ),
);
