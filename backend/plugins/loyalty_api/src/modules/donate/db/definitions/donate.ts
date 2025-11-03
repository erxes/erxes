import { Schema } from 'mongoose';

import { schemaWrapper } from 'erxes-api-shared/utils';

export const donateSchema = schemaWrapper(
  new Schema(
    {
      ownerId: { type: String, label: 'Owner ID' },
      ownerType: { type: String, label: 'Owner Type' },

      campaignId: { type: String, label: 'Campaign ID' },

      donateScore: { type: Number },
      awardId: { type: String, label: 'Won Award', optional: true },
      voucherId: { type: String, label: 'Won Voucher', optional: true },

      conditions: { type: Schema.Types.Mixed, label: 'Conditions' },
    },
    {
      timestamps: true,
    },
  ),
);
