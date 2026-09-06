import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const viberIntegrationSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxId: { type: String, required: true, unique: true },
  botId: { type: String, required: true, unique: true },
  token: { type: String, required: true, select: false },
});
