import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const callProIntegrationSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxId: { type: String, index: true, label: 'Inbox integration id' },
  phoneNumber: { type: String, unique: true, label: 'Call Pro phone number' },
  recordUrl: { type: String, label: 'Call Pro record url' },
});
