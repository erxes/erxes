import { Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';

// One line per actual tier change of an account in one wallet.
export const loyaltyTierLogSchema = schemaWrapper(
  new Schema(
    {
      accountId: { type: String, label: 'Loyalty account' },
      ownerType: { type: String, label: 'Owner type' },
      ownerId: { type: String, label: 'Owner' },
      accountTypeId: { type: String, label: 'Loyalty account type' },
      fromTier: { type: String, label: 'From tier', default: null },
      toTier: { type: String, label: 'To tier', default: null },
      direction: { type: String, enum: ['up', 'down'], label: 'Direction' },
      createdBy: { type: String, label: 'Created user', optional: true },
      createdVia: { type: Object, label: 'Created via', optional: true },
      targetId: { type: String, label: 'Target', optional: true },
      targetType: { type: String, label: 'Target type', optional: true },
      targetName: { type: String, label: 'Target name', optional: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
  ),
);

loyaltyTierLogSchema.index({ accountId: 1, createdAt: -1 });
loyaltyTierLogSchema.index({ targetId: 1, createdAt: -1 });
