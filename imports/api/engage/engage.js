import { Meteor } from 'meteor/meteor';
import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import Segments from '/imports/api/customers/segments';
import { TagsCollection, tagsHelper, tagSchemaOptions } from '/imports/api/tags/utils';

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
