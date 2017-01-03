/* eslint-disable new-cap */

import Mongoose from 'mongoose';
import Random from 'meteor-random';
import settings from '../server-settings';

Mongoose.connect(
  settings.MONGO_URL, {
    server: {
      // after server reload, user must not reload widget manually
      auto_reconnect: true,
    },
  }
);

const UserSchema = Mongoose.Schema({
  _id: String,
  details: {
    avatar: String,
  },
});

const BrandSchema = Mongoose.Schema({
  _id: String,
  code: String,
});

const IntegrationSchema = Mongoose.Schema({
  _id: String,
  brandId: String,
  kind: String,
});

const CustomerSchema = Mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  integrationId: String,
  email: String,
  name: String,
  createdAt: Date,
  inAppMessagingData: Object,
});

const ConversationSchema = Mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  content: String,
  customerId: String,
  integrationId: String,
  status: String,
  readUserIds: [String],
});

const AttachmentSchema = Mongoose.Schema({
  url: String,
  name: String,
  size: Number,
  type: String,
});

const MessageSchema = Mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  userId: String,
  conversationId: String,
  customerId: String,
  content: String,
  attachments: [AttachmentSchema],
  createdAt: Date,
  isCustomerRead: Boolean,
  internal: Boolean,
});


const Users = Mongoose.model('users', UserSchema);
const Brands = Mongoose.model('brands', BrandSchema);
const Integrations = Mongoose.model('integrations', IntegrationSchema);
const Customers = Mongoose.model('customers', CustomerSchema);
const Conversations = Mongoose.model('conversations', ConversationSchema);
const Messages = Mongoose.model('conversation_messages', MessageSchema);

export { Users, Brands, Integrations, Customers, Conversations, Messages };
