import { Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { LOYALTY_STATUSES } from '~/constants';

/**
 * Embedded award schema
 */
export const lotteryAwardSchema = new Schema(
  {
    name: { type: String, label: 'Name' },

    voucherCampaignId: {
      type: String,
      label: 'Voucher Campaign',
    },

    count: {
      type: Number,
      label: 'Count',
      min: 0,
    },

    wonLotteryIds: {
      type: [String],
      label: 'Won Lottery IDs',
      optional: true,
    },
  },
  {
    _id: false,
  },
);

/**
 * Lottery campaign schema
 */
export const lotteryCampaignSchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, label: 'Name' },
      description: { type: String, optional: true },

      status: {
        type: String,
        enum: LOYALTY_STATUSES.ALL,
        default: 'active',
      },

      numberFormat: {
        type: String,
        label: 'Number Format Type',
      },

      buyScore: {
        type: Number,
        label: 'Buy Score',
      },

      awards: {
        type: [lotteryAwardSchema],
        label: 'Awards',
      },
    },
    {
      timestamps: true,
    },
  ),
);
