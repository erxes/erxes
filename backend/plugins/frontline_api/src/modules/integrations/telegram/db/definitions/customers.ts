import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const telegramCustomerSchema = new Schema({
  _id: mongooseStringRandomId,
  userId: {
    type: String,
    required: true,
    unique: true,
    label: 'Telegram user id',
  },
  erxesApiId: {
    type: String,
    label: 'Customer id at core',
  },
  firstName: String,
  lastName: String,
  username: String,
  integrationId: {
    type: String,
    required: true,
    label: 'Inbox integration id',
  },
});
