import { Schema } from 'mongoose';

import { LOTTERY_STATUS } from '@/lottery/constants';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { commonSchema } from '~/utils';

export const lotterySchema = schemaWrapper(
  new Schema(
    {
      ...commonSchema,

      status: { type: String, enum: LOTTERY_STATUS.ALL, default: 'new' },
      number: { type: String, optional: true, label: 'Lottery number' },

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
