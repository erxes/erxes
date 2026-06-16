import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const integrationSchema = new Schema({
  _id: mongooseStringRandomId,
  kind: String,
  erxesApiId: { type: String, index: true },
  phoneNumberId: { type: String, index: true },
  accessToken: String,
  businessAccountId: String,
  verifyToken: String,
  healthStatus: String,
  error: String,
});
