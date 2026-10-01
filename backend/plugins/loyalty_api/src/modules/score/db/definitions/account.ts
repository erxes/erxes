import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const loyaltyAccountBalanceSchema = new Schema(
  {
    balance: { type: Number },
    pending: { type: Number },
    lots: { type: Boolean },
    updatedAt: { type: Date },
    tier: { type: String },
    tierSince: { type: Date },
    resetAt: { type: Date },
  },
  { _id: false },
);

export const loyaltyAccountSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    number: { type: String, required: true, unique: true, label: 'Number' },
    ownerType: {
      type: String,
      enum: ['customer', 'company', 'user'],
      required: true,
      label: 'Owner type',
    },
    ownerId: { type: String, required: true, label: 'Owner' },
    status: {
      type: String,
      enum: ['active', 'frozen', 'closed'],
      default: 'active',
      label: 'Status',
    },
    balances: {
      type: Map,
      of: loyaltyAccountBalanceSchema,
      default: {},
      label: 'Balances by account type',
    },
    joinedAt: { type: Date, default: Date.now, label: 'Joined at' },
    frozenAt: { type: Date, label: 'Frozen at' },
    frozenBy: { type: String, label: 'Frozen by' },
    frozenReason: { type: String, label: 'Freeze reason' },
  },
  { timestamps: true },
);

loyaltyAccountSchema.index({ ownerType: 1, ownerId: 1 }, { unique: true });
