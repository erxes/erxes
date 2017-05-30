import faker from 'faker';
import { Factory } from 'meteor/dburles:factory';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Messages = new Mongo.Collection('engage_messages');

Messages.schema = new SimpleSchema({
  segmentId: {
    type: String,
  },
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  customerIds: {
    type: [String],
  },
  isAuto: {
    type: Boolean,
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
});

Messages.attachSchema(Messages.schema);
Messages.attachSchema(Messages.schemaExtra);

Factory.define('engage.messages', Messages, {
  title: () => faker.random.word(),
});
