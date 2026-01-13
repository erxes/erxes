import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';
import { CAMPAIGN_STATUS } from '~/modules/campaign/constants';

export const campaignSchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, label: 'Name' },
      description: { type: String, label: 'Description' },

      startDate: { type: Date, label: 'Start Date' },
      endDate: { type: Date, label: 'End Date' },

      status: {
        type: String,
        label: 'Status',
        enum: CAMPAIGN_STATUS.ALL,
        default: CAMPAIGN_STATUS.INACTIVE,
      },

      type: { type: String, label: 'Type' },
      amount: { type: Number, label: 'Amount' },

      createdBy: { type: String, label: 'Created by' },
      updatedBy: { type: String, label: 'Updated by' },

      conditions: { type: Schema.Types.Mixed, label: 'Conditions' },

      kind: { type: String, label: 'Kind', required: true },
    },
    {
      timestamps: true,
    },
  ),
);
