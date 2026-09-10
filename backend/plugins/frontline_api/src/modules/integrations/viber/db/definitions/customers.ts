import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const viberCustomerSchema = new Schema({
  _id: mongooseStringRandomId,
  inboxId: { type: String, required: true },
  userId: { type: String, required: true },
  contactsId: { type: String, required: true },
});

viberCustomerSchema.index({ inboxId: 1, userId: 1 }, { unique: true });
