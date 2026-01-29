import { Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { CAMPAIGN_STATUS } from '~/modules/campaign/constants';
import {
  OWNER_TYPES
} from '~/constants';

/**
 * Embedded award schema
 */
export const spinAwardSchema = new Schema(
  {
    _id: {
      type: String,
    },

    name: {
      type: String,
      required: true,
      label: 'Award name',
    },

    voucherCampaignId: {
      type: String,
      required: true,
      label: 'Voucher campaign ID',
    },

    probability: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
      label: 'Win probability (%)',
    },
  },
  { _id: false },
);

/**
 * Spin Campaign schema
 */
export const spinCampaignSchema = schemaWrapper(
  new Schema(
    {
      title: {
        type: String,
        required: true,
        label: 'Campaign title',
      },

      description: {
        type: String,
        optional: true,
        label: 'Description',
      },

      ownerType: {
        type: String,
        enum: OWNER_TYPES.ALL,
        required: true,
        label: 'Owner type',
      },

      status: {
        type: String,
        enum: CAMPAIGN_STATUS.ALL,
        default: CAMPAIGN_STATUS.INACTIVE,
        label: 'Campaign status',
      },

      startDate: {
        type: Date,
        optional: true,
        label: 'Start date',
      },

      endDate: {
        type: Date,
        optional: true,
        label: 'End date',
      },

      buyScore: {
        type: Number,
        min: 0,
        optional: true,
        label: 'Score required to spin',
      },

      awards: {
        type: [spinAwardSchema],
        default: [],
        label: 'Spin awards',
      },

      createdBy: {
        type: String,
        label: 'Created by',
      },

      updatedBy: {
        type: String,
        label: 'Updated by',
      },
    },
    {
      timestamps: true,
    },
  ),
);
