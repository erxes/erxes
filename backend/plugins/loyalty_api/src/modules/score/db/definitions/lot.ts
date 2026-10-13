import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const loyaltyLotSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    accountId: { type: String, required: true, label: 'Loyalty account' },
    key: { type: String, required: true, label: 'Balance key' },
    sourceLogId: { type: String, label: 'Earning score log' },
    amount: { type: Number, required: true, label: 'Earned' },
    remaining: { type: Number, required: true, label: 'Remaining' },
    availableAt: { type: Date, required: true, label: 'Spendable from' },
    expiresAt: { type: Date, label: 'Expires at' },
    sortAt: { type: Date, required: true, label: 'Spending order' },
    status: {
      type: String,
      enum: ['pending', 'available', 'closed'],
      required: true,
      label: 'Status',
    },
    releasingAt: { type: Date, label: 'Being released since' },
    expiringAt: { type: Date, label: 'Being expired since' },
  },
  { timestamps: true },
);

loyaltyLotSchema.index({ accountId: 1, key: 1, status: 1, sortAt: 1 });
loyaltyLotSchema.index({ sourceLogId: 1 }, { sparse: true });
loyaltyLotSchema.index({ status: 1, availableAt: 1 });
loyaltyLotSchema.index({ status: 1, expiresAt: 1 });
