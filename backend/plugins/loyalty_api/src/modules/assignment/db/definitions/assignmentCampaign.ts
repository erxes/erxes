import { Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { LOYALTY_STATUSES } from '~/constants';

export const assignmentCampaignSchema = schemaWrapper(
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

      segmentIds: {
        type: [String],
        label: 'Segment IDs',
        required: true,
      },

      fieldId: {
        type: String,
        label: 'Field ID',
        optional: true,
      },

      voucherCampaignId: {
        type: String,
        label: 'Voucher Campaign ID',
        required: true,
      },

      allowMultiWin: {
        type: Boolean,
        label: 'Allow multiple win',
        default: false,
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
