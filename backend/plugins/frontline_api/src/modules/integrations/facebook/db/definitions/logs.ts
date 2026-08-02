import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { LOG_TYPES } from '@/integrations/facebook/constants';
export const logSchema = new Schema({
  _id: mongooseStringRandomId,
  type: { type: String, enum: LOG_TYPES.ALL },
  value: { type: Object },
  specialValue: { type: String },
  createdAt: { type: Date },
});

// Logs (including the post audit trail) are operational evidence, not business
// data — expire them so the collection cannot grow unbounded. 180 days
// comfortably covers a Meta App Review appeal window.
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 3600 });
