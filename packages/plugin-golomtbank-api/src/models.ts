import { Schema, model } from 'mongoose';

export const customerSchema = new Schema({
  inboxIntegrationId: String,
  contactsId: String,
  email: { type: String, unique: true },
  firstName: String,
  lastName: String
});

export const loadCustomerClass = () => {
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
  return messageSchema;
};

// schema for integration document
export const integrationSchema = new Schema({
  inboxId: String,
  accountId: String
});

export const loadIntegrationClass = () => {

  return integrationSchema;
};

// schema for integration account
export const accountSchema = new Schema({
  name: String
});

export const loadAccountClass = () => {
  class Account {
    static async removeAccount(_id) {
      return Accounts.deleteOne({ _id });
    }

    static async getAccounts() {
      return Accounts.find({});
    }
  }

  accountSchema.loadClass(Account);

  return accountSchema;
};


export const Customers = model<any, any>(
  'golomtbank_customers',
  loadCustomerClass()
);

export const Integrations = model<any, any>(
  'golomtbank_integrations',
  loadIntegrationClass()
);

export const Messages = model<any, any>(
  'golomtbank_messages',
  loadMessageClass()
);

export const Accounts = model<any, any>('golomtbank_accounts', loadAccountClass());