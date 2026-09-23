import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const integrationSchema = new Schema({
  _id: mongooseStringRandomId,
  kind: { type: String },
  erxesApiId: { type: String, index: true },
  accountId: { type: String, index: true },
  phoneNumberId: { type: String, unique: true },
  accessToken: { type: String },
  businessAccountId: { type: String },
  pageId: { type: String },
  healthStatus: { type: String },
  error: { type: String },
});
