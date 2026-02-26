import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const customerSchema = new Schema({
  _id: mongooseStringRandomId,
  userId: { type: String, unique: true, label: 'Instagram user id' },
  erxesApiId: { type: String, label: 'Customer id at contacts-api' },
  firstName: String,
  lastName: String,
  profilePic: String,
  integrationId: { type: String, label: 'Inbox integration id' },
});
