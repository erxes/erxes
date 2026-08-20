import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const callProCustomerSchema = new Schema({
  _id: mongooseStringRandomId,
  phoneNumber: { type: String, unique: true, label: 'Caller phone number' },
  integrationId: { type: String, label: 'Call Pro integration id' },
  erxesApiId: { type: String, label: 'Customer id at contacts-api' },
});
