import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { commonCampaignSchema } from '~/utils';

export const assignmentCampaignSchema = schemaWrapper(
  new Schema(
    {
      ...commonCampaignSchema,
      segmentIds: { type: [String], label: 'Segment Data' },
      fieldId: { type: String, label: 'Fied Id', optional: true },
      allowMultiWin: {
        type: Boolean,
        label: 'Allow multiple Win',
        optional: true,
      },
      voucherCampaignId: { type: String, label: 'Voucher Campaign Id' },
    },
    {
      timestamps: true,
    },
  ),
);
