import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

const scanProductRowSchema = new Schema(
  {
    productId: { type: String, required: true, label: 'Product' },
    expectedPacks: { type: Number, required: true, label: 'Expected packs' },
    scannedPacks: { type: Number, required: true, label: 'Scanned packs' },
  },
  { _id: false },
);

export const scanSessionSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    zoneId: { type: String, required: true, label: 'Zone' },
    scannedCount: { type: Number, required: true },
    matchedCount: { type: Number, required: true },
    missingCount: { type: Number, required: true },
    unknownCount: { type: Number, required: true },
    openedCount: { type: Number, required: true },
    otherZoneCount: { type: Number, required: true },
    missingEpcIds: { type: [String], default: [] },
    unknownEpcIds: { type: [String], default: [] },
    openedEpcIds: { type: [String], default: [] },
    otherZoneEpcIds: { type: [String], default: [] },
    products: { type: [scanProductRowSchema], default: [], label: 'Products' },
    userId: { type: String, label: 'User' },
  },
  { timestamps: true },
);

scanSessionSchema.index({ zoneId: 1, createdAt: -1 });
