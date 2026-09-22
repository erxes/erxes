import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const mailCustomerSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxIntegrationId: { type: String, label: 'Inbox integration id' },
  contactsId: { type: String, label: 'Customer id at contacts-api' },
  email: { type: String, unique: true },
  firstName: String,
  lastName: String,
});
