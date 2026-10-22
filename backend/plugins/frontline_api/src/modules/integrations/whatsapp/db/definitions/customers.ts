import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const whatsappCustomerSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    integrationId: {
      type: String,
      required: true,
      label: 'Inbox integration id',
    },
    waId: { type: String, label: 'WhatsApp phone id (wa_id)' },
    userId: { type: String, label: 'Business-scoped user id' },
    name: { type: String },
    erxesApiId: { type: String, index: true, label: 'Customer id at core' },
  },
  { timestamps: true },
);

whatsappCustomerSchema.index(
  { integrationId: 1, waId: 1 },
  { unique: true, partialFilterExpression: { waId: { $type: 'string' } } },
);

whatsappCustomerSchema.index(
  { integrationId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'string' } } },
);
