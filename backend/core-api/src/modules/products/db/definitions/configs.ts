import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const productsConfigSchema = new Schema({
  _id: mongooseStringRandomId,
  code: { type: String, unique: true },
  value: { type: Object },
});
