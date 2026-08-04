import { SPIN_STATUS } from '@/spin/constants';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { commonSchema } from '~/utils';

export const spinSchema = schemaWrapper(
  new Schema(
    {
      ...commonSchema,
      status: { type: String, enum: SPIN_STATUS.ALL, default: 'new' },
      voucherCampaignId: {
        type: String,
        label: 'Source Voucher Campaign',
        optional: true,
      },

      // won
      awardId: { type: String, label: 'Won award' },
      voucherId: { type: String, label: 'Won Voucher', optional: true },
    },
    {
      timestamps: true,
    },
  ),
);
