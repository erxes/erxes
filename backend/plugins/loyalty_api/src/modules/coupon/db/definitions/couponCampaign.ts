import { Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { LOYALTY_STATUSES } from '~/constants';

export const couponCampaignSchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, label: 'Name' },
      description: { type: String, label: 'Description', optional: true },

      status: {
        type: String,
        label: 'Status',
        enum: LOYALTY_STATUSES.ALL,
        default: LOYALTY_STATUSES.ACTIVE,
      },

      kind: {
        type: String,
        label: 'Discount type',
        enum: ['amount', 'percent'],
        required: true,
      },

      value: {
        type: Number,
        label: 'Discount value',
        required: true,
        min: 0,
      },

      codeRule: {
        type: Schema.Types.Mixed,
        label: 'Code rule',
      },

      restrictions: {
        type: Schema.Types.Mixed,
        label: 'Restrictions',
      },

      redemptionLimitPerUser: {
        type: Number,
        label: 'Redemption limit per user',
        min: 1,
        default: 1,
      },

      buyScore: {
        type: Number,
        label: 'Buy score',
        min: 0,
      },

      createdBy: { type: String, label: 'Created by' },
      updatedBy: { type: String, label: 'Updated by' },
    },
    {
      timestamps: true,
    },
  ),
);
