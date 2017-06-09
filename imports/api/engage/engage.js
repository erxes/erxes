import { Meteor } from 'meteor/meteor';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import Segments from '/imports/api/customers/segments';

export const Messages = new Mongo.Collection('engage_messages');

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

Messages.schema = new SimpleSchema({
  segmentId: {
    type: String,
  },
  title: {
    type: String,
  },
  fromUserId: {
    type: String,
  },
  email: {
    type: EmailSchema,
    optional: true,
  },
  isAuto: {
    type: Boolean,
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
});

Messages.attachSchema(Messages.schema);
Messages.attachSchema(Messages.schemaExtra);

Factory.define('engage.messages', Messages, {
  title: () => faker.random.word(),
});
