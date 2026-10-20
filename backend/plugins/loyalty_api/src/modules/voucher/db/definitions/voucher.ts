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

      // What the campaign promised when this voucher was issued.
      terms: { type: Object, optional: true, label: 'Terms' },
      createdVia: { type: Object, optional: true, label: 'Created via' },
      // The order or deal it is held for (onhold) or was used on (used).
      usedIn: {
        type: new Schema(
          {
            targetType: { type: String },
            targetId: { type: String, index: true },
            note: { type: String },
          },
          { _id: false },
        ),
        optional: true,
        label: 'Used in',
      },
      heldAt: { type: Date, optional: true, label: 'Held at' },
      cancelledAt: { type: Date, optional: true, label: 'Cancelled at' },
      cancelledBy: { type: String, optional: true, label: 'Cancelled by' },
      cancelReason: { type: String, optional: true, label: 'Cancel reason' },
      history: { type: [Object], default: undefined, label: 'History' },
    },
    {
      timestamps: true,
    },
  ),
);
