import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';
import { LOYALTY_STATUSES } from '~/constants';

export const spinSchema = schemaWrapper(
  new Schema(
    {
      ownerId: { type: String, label: 'Owner ID' },
      ownerType: { type: String, label: 'Owner Type' },
      campaignId: { type: String, label: 'Campaign ID' },
      status: { type: String, enum: LOYALTY_STATUSES.ALL, default: 'new' },

      voucherCampaignId: {
        type: String,
        label: 'Source Voucher Campaign',
        optional: true,
      },

      // won
      awardId: { type: String, label: 'Won award' },
      voucherId: { type: String, label: 'Won Voucher', optional: true },

      createdBy: { type: String, label: 'Created By' },
      updatedBy: { type: String, label: 'Updated By' },
    },
    {
      timestamps: true,
    },
  ),
);
