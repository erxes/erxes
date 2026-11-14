import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const papaConfigSchema = new Schema({
  _id: mongooseStringRandomId,
  apiUrl: { type: String, label: 'Papa API URL' },
  clientId: { type: String, label: 'Papa client id' },
  clientSecret: { type: String, label: 'Papa client secret' },
  staffId: { type: String, label: 'Papa staff id' },
  callbackSecret: { type: String, label: 'Callback path secret' },
  callbackUrl: { type: String, label: 'Registered callback URL' },
  callbackRegisteredAt: { type: Date, label: 'Callback registered at' },
  updatedAt: { type: Date, label: 'Updated at' },
  updatedBy: { type: String, label: 'Updated by' },
});
