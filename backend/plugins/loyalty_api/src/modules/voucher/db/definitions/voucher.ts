import { VOUCHER_STATUS } from '@/voucher/constants';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { commonSchema } from '~/utils';

export const voucherSchema = schemaWrapper(
  new Schema(
    {
      ...commonSchema,

      status: {
        type: String,
        enum: VOUCHER_STATUS.ALL,
        default: 'new',
        label: 'Status',
      },
      // etc: bonus-> usedCount
      bonusInfo: { type: Object, optional: true, label: 'Bonus log' },

      // Optional voucher configuration for standalone config (not tied to campaigns)
      config: { type: Object, optional: true, label: 'Config' },
    },
    {
      timestamps: true,
    },
  ),
);
