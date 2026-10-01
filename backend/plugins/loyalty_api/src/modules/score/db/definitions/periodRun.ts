import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const loyaltyPeriodRunSchema = new Schema({
  _id: mongooseStringRandomId,
  startedAt: { type: Date, required: true, label: 'Started at' },
  finishedAt: { type: Date, label: 'Finished at' },
  status: {
    type: String,
    enum: ['running', 'done', 'failed'],
    required: true,
    label: 'Status',
  },
  batches: { type: Number, default: 0, label: 'Batches' },
  released: { type: Number, default: 0, label: 'Released lots' },
  expired: { type: Number, default: 0, label: 'Expired lots' },
  reset: { type: Number, default: 0, label: 'Reset accounts' },
  failed: { type: Number, default: 0, label: 'Failed' },
  error: { type: String, label: 'Error' },
});

loyaltyPeriodRunSchema.index({ startedAt: -1 });
