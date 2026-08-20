import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const callProLogSchema = new Schema({
  _id: mongooseStringRandomId,
  type: { type: String, label: 'Log type' },
  value: { type: Object, label: 'Raw Call Pro payload' },
  specialValue: { type: String, label: 'Caller number' },
  createdAt: { type: Date, label: 'Created at' },
});
