import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { LOG_TYPES } from '@/integrations/instagram/constants';

export const logSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    type: { type: String, enum: LOG_TYPES.ALL },
    value: { type: Object },
    specialValue: { type: String },
    createdAt: { type: Date },
  }),
);
