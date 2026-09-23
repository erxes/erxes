import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const customerSchema = new Schema({
  _id: mongooseStringRandomId,
  userId: { type: String, label: 'WhatsApp user id' },
  erxesApiId: { type: String, label: 'Customer id at contacts-api' },
  firstName: { type: String },
  lastName: { type: String },
  profilePic: { type: String },
  integrationId: { type: String, label: 'Inbox integration id' },
});

customerSchema.index(
  { userId: 1, integrationId: 1 },
  { unique: true },
);
