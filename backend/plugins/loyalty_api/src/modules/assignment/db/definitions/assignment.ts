import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';
import { LOYALTY_STATUSES, OWNER_TYPES } from '~/constants';

export const assignmentSchema = schemaWrapper(
  new Schema(
    {
      ownerId: { type: String, label: 'Owner ID' },
      ownerType: {
        type: String,
        label: 'Owner Type',
        enum: OWNER_TYPES.ALL,
      },

      status: {
        type: String,
        label: 'Status',
        enum: LOYALTY_STATUSES.ALL,
        default: 'new',
      },

      campaignId: { type: String, label: 'Campaign ID' },

      conditions: { type: Schema.Types.Mixed, label: 'Conditions' },

      createdBy: { type: String, label: 'Created By' },
      updatedBy: { type: String, label: 'Updated By' },
    },
    {
      timestamps: true,
    },
  ),
);
