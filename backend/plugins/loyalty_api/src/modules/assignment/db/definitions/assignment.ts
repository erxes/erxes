import { Schema } from 'mongoose';

import { ASSIGNMENT_STATUS } from '@/assignment/constants';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { commonSchema } from '~/utils';

export const assignmentSchema = schemaWrapper(
  new Schema(
    {
      ...commonSchema,
      status: {
        type: String,
        enum: ASSIGNMENT_STATUS.ALL,
        default: ASSIGNMENT_STATUS.NEW,
      },
      segmentIds: { type: [String], label: 'Segment Data' },
      voucherCampaignId: {
        type: String,
        label: 'Source Voucher Campaign',
        optional: true,
      },
      voucherId: { type: String, label: 'Won Voucher', optional: true },
    },
    {
      timestamps: true,
    },
  ),
);
