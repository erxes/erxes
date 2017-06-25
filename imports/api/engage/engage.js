import { Meteor } from 'meteor/meteor';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import Segments from '/imports/api/customers/segments';
import { TagsCollection, tagsHelper, tagSchemaOptions } from '/imports/api/tags/utils';
import { MESSAGE_KINDS, MESSENGER_KINDS, METHODS, SENT_AS_CHOICES } from './constants';

export const Messages = new TagsCollection('engage_messages');

Messages.TAG_TYPE = 'engageMessage';

const EmailSchema = new SimpleSchema({
  templateId: {
    type: String,
    optional: true,
  },
  subject: {
    type: String,
  },
  content: {
    type: String,
  },
});

// visistor auto message's per rule schema
const RuleSchema = new SimpleSchema({
  _id: { type: String },

  // browserLanguage, currentUrl, etc ...
  kind: { type: String },

  // Browser language, Current url etc ...
  text: { type: String },

  // is, isNot, startsWith
  condition: { type: String },

  value: { type: String, optional: true },
});

const MessengerSchema = new SimpleSchema({
  brandId: {
    type: String,
  },
  kind: {
    type: String,
    allowedValues: MESSENGER_KINDS.ALL_LIST,
    optional: true,
  },
  sentAs: {
    type: String,
    allowedValues: SENT_AS_CHOICES.ALL_LIST,
  },
  content: {
    type: String,
  },
  rules: {
    type: [RuleSchema],
    optional: true,
  },
});

Messages.schema = new SimpleSchema({
  // auto, visitorAuto, manual
  kind: {
    type: String,
    allowedValues: MESSAGE_KINDS.ALL_LIST,
  },

  // targets
  segmentId: {
    type: String,
    optional: true,
  },
  customerIds: {
    type: [String],
    optional: true,
  },

  title: {
    type: String,
  },
  fromUserId: {
    type: String,
  },

  // messenger, email etc ...
  method: {
    type: String,
    allowedValues: METHODS.ALL_LIST,
  },

  // email kind fields
  email: {
    type: EmailSchema,
    optional: true,
  },

  // messenger kind fields
  messenger: {
    type: MessengerSchema,
    optional: true,
  },

  isDraft: {
    type: Boolean,
    optional: true,
  },
  isLive: {
    type: Boolean,
    optional: true,
  },
  stopDate: {
    type: Date,
    optional: true,
  },
  ...tagSchemaOptions(),
});

Messages.schemaExtra = new SimpleSchema({
  createdUserId: {
    type: String,
  },

  createdDate: {
    type: Date,
  },

  // for example, save each customers's email delivery reports by messageId
  deliveryReports: {
    type: Object,
    blackbox: true,
    optional: true,
  },
});

Messages.helpers({
  fromUser() {
    return Meteor.users.findOne(this.fromUserId) || {};
  },

  segment() {
    return Segments.findOne(this.segmentId) || {};
  },

  ...tagsHelper,
});

Messages.attachSchema(Messages.schema);
Messages.attachSchema(Messages.schemaExtra);

Factory.define('engage.messages', Messages, {
  title: () => faker.random.word(),
});
