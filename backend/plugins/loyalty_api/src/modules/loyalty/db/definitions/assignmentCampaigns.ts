import { Document, Schema } from 'mongoose';
import { commonCampaignSchema } from './common';
import { field } from './utils';

export const assignmentCampaignSchema = new Schema({
  ...commonCampaignSchema,
  segmentIds: field({ type: [String], label: 'Segment Data' }),
  fieldId: field({ type: String, label: 'Fied Id', optional: true }),
  allowMultiWin: field({
    type: Boolean,
    label: 'Allow multiple Win',
    optional: true,
  }),
  voucherCampaignId: field({ type: String, label: 'Voucher Campaign Id' }),
});
