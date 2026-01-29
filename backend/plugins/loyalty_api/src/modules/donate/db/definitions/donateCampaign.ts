import { Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { LOYALTY_STATUSES } from '~/constants';

/**
 * Embedded donate award schema
 */
export const donateAwardSchema = new Schema({
  minScore: {
    type: Number,
    label: 'Min score',
    required: true,
  },

  voucherCampaignId: {
    type: String,
    label: 'Voucher campaign',
    required: true,
  },
});
/**
 * Donate campaign schema
 */
export const donateCampaignSchema = schemaWrapper(
  new Schema(
    {
      name: {
        type: String,
        label: 'Name',
      },

      description: {
        type: String,
        label: 'Description',
        optional: true,
      },

      status: {
        type: String,
        label: 'Status',
        enum: LOYALTY_STATUSES.ALL,
        default: LOYALTY_STATUSES.ACTIVE,
      },

      awards: {
        type: [donateAwardSchema],
        label: 'Awards',
        optional: true,
      },

      maxScore: {
        type: Number,
        label: 'Max score',
        optional: true,
      },

      createdBy: { type: String, label: 'Created by' },
      updatedBy: { type: String, label: 'Updated by' },
    },
    {
      timestamps: true,
    },
  ),
);
