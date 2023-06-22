import { Schema, model } from 'mongoose';

export const chatSchema = new Schema({
  botAccountId: String,
  telegramId: { type: String, unique: true },
  title: String,
  chatType: String,
  memberType: String
});

export const loadChatClass = () => {
  class Chat {
    static async getAllChats() {
      return Chats.find({});
    }

    static async createOrUpdate(find, chat) {
      return Chats.update(find, chat, { upsert: true });
    }
  }

  chatSchema.loadClass(Chat);

  return chatSchema;
};

export const customerSchema = new Schema({
  inboxIntegrationId: String,
  contactsId: String,
  telegramId: { type: String, unique: true },
  firstName: String,
  lastName: String
});

export const loadCustomerClass = () => {
  class Customer {}

  customerSchema.loadClass(Customer);

  return customerSchema;
};

const telegramAddressSchema = new Schema(
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
  chatId: String,
  inReplyTo: String,
  references: [String],
  body: String,
  to: telegramAddressSchema,
  cc: telegramAddressSchema,
  bcc: telegramAddressSchema,
  from: telegramAddressSchema,
  createdAt: { type: Date, index: true, default: new Date() }
});

export const loadMessageClass = () => {
  class Message {}

  messageSchema.loadClass(Message);

  return messageSchema;
};

// schema for integration document
export const integrationSchema = new Schema({
  inboxIntegrationId: String,
  accountId: String,
  telegramChatId: String
});

export const loadIntegrationClass = () => {
  class Integration {}

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};

// schema for integration account
export const accountSchema = new Schema({
  name: String,
  token: String
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

export const Chats = model<any, any>('telegram_chats', loadChatClass());

export const Customers = model<any, any>(
  'telegram_customers',
  loadCustomerClass()
);

export const Integrations = model<any, any>(
  'telegram_integrations',
  loadIntegrationClass()
);

export const Messages = model<any, any>(
  'telegram_messages',
  loadMessageClass()
);

export const Accounts = model<any, any>(
  'telegram_accounts',
  loadAccountClass()
);
