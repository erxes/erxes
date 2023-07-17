import { field } from '@erxes/api-utils/src';
import { Schema, model } from 'mongoose';

export const customerSchema = new Schema({
  inboxIntegrationId: String,
  contactsId: String,
  discordId: { type: String, unique: true },
  username: String,
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
  channelId: String,
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
  class Message {
    static async getMessages(selector) {
      return Messages.find(selector);
    }
  }

  messageSchema.loadClass(Message);

  return messageSchema;
};

// schema for integration document
export const integrationSchema = new Schema({
  inboxId: String,
  accountId: String,
  discordChannelIds: field({
    type: [String],
    label: 'Discord channel ids',
    optional: true
  })
});

export const loadIntegrationClass = () => {
  class Integration {
    static async getIntegration(selector) {
      return Integrations.findOne(selector);
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};

// schema for integration account
export const accountSchema = new Schema({
  name: String,
  guildId: String
});

export const loadAccountClass = () => {
  class Account {
    static async removeAccount(_id) {
      return Accounts.deleteOne({ _id });
    }

    static async getAccounts() {
      return Accounts.find({});
    }

    static async getAccount(selector) {
      const account = await Accounts.findOne(selector);

      return account;
    }
  }

  accountSchema.loadClass(Account);

  return accountSchema;
};

export const Customers = model<any, any>(
  'discord_customers',
  loadCustomerClass()
);

export const Integrations = model<any, any>(
  'discord_integrations',
  loadIntegrationClass()
);

export const Messages = model<any, any>('discord_messages', loadMessageClass());

export const Accounts = model<any, any>('discord_accounts', loadAccountClass());
