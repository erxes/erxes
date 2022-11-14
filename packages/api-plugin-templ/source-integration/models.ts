import { Schema, model } from 'mongoose';

export const customerSchema = new Schema({
  inboxIntegrationId: String,
  contactsId: String,
  email: { type: String, unique: true },
  firstName: String,
  lastName: String
});

export const loadCustomerClass = () => {
  class Customer {}

  customerSchema.loadClass(Customer);

  return customerSchema;
};

const emailSchema = new Schema(
  {
    name: String,
    address: String
  },
  { _id: false }
);

export const messageSchema = new Schema({
  inboxIntegrationId: String,
  inboxConversationId: String,
  subject: String,
  messageId: { type: String, unique: true },
  inReplyTo: String,
  references: [String],
  body: String,
  to: [emailSchema],
  cc: [emailSchema],
  bcc: [emailSchema],
  from: [emailSchema],
  createdAt: { type: Date, index: true, default: new Date() }
});

export const loadMessageClass = () => {
  class Message {}

  messageSchema.loadClass(Message);

  return messageSchema;
};

// schema for integration document
export const integrationSchema = new Schema({
  inboxId: String,
  host: String,
  smtpHost: String,
  smtpPort: String,
  user: String,
  password: String
});

export const loadIntegrationClass = () => {
  class Integration {}

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};

export const Customers = model<any, any>(
  '{name}_customers',
  loadCustomerClass()
);

export const Integrations = model<any, any>(
  '{name}_integrations',
  loadIntegrationClass()
);

export const Messages = model<any, any>(
  '{name}_messages',
  loadMessageClass()
);