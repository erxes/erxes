import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';
import { LOYALTY_STATUSES, OWNER_TYPES } from '~/constants';

export const couponSchema = schemaWrapper(
  new Schema(
    {
      campaignId: { type: Schema.Types.ObjectId, label: 'Campaign ID' },

      ownerId: { type: String, label: 'Owner ID' },
      ownerType: { type: String, label: 'Owner Type', enum: OWNER_TYPES.ALL },

      code: {
        type: String,
        label: 'Code',
        required: true,
        unique: true,
      },
      status: {
        type: String,
        label: 'Status',
        enum: LOYALTY_STATUSES.ALL,
        default: LOYALTY_STATUSES.NEW,
      },

      createdBy: { type: String, label: 'Created by' },
      updatedBy: { type: String, label: 'Updated by' },

      conditions: { type: Schema.Types.Mixed, label: 'Conditions' },
    },
    {
      timestamps: true,
    },
  ),
);
