import { commonSchema } from './common';
import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { ASSIGNMENT_STATUS } from '~/modules/loyalty/@types/constants';

export const assignmentSchema = schemaHooksWrapper(
  new Schema({
    ...commonSchema,
    status: field({
      type: String,
      enum: ASSIGNMENT_STATUS.ALL,
      default: 'new',
    }),
    segmentIds: field({ type: [String], label: 'Segment Data' }),
    voucherCampaignId: field({
      type: String,
      label: 'Source Voucher Campaign',
      optional: true,
    }),
    voucherId: field({ type: String, label: 'Won Voucher', optional: true }),
  }),
  'erxes_loyalty_assignments',
);
