import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const whatsappConfigSchema = new Schema({
  _id: mongooseStringRandomId,
  code: { type: String, required: true, unique: true },
  value: { type: String, default: '' },
});
