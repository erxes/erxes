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
