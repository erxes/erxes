import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const rfidTagSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    epcId: { type: String, required: true, unique: true, match: /^[0-9A-F]{24}$/, label: 'EPC' },
    productId: { type: String, required: true, label: 'Product' },
    unitsInPack: { type: Number, required: true, min: 1, label: 'Units in pack' },
    zoneId: { type: String, required: true, label: 'Zone' },
    status: { type: String, enum: ['SEALED', 'OPENED'], default: 'SEALED', label: 'Status' },
    batchId: { type: String, index: true, label: 'Registration batch' },
    movementId: { type: String, index: true, label: 'Movement' },
    createdBy: { type: String, label: 'Created by' },
  },
  { timestamps: true },
);

rfidTagSchema.index({ zoneId: 1, status: 1, productId: 1 });
