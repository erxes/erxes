import faker from 'faker';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Customers } from '/imports/api/customers/customers';
import messageCountDenormalizer from './messageCountDenormalizer.js';

import { addParticipator } from './conversations';

class MessagesCollection extends Mongo.Collection {
  insert(doc, callback) {
    const message = _.extend({ createdAt: new Date() }, doc);

    const result = super.insert(message, callback);

    messageCountDenormalizer.afterInsertMessage(message);

    if (message.userId) {
      addParticipator({
        conversationId: message.conversationId,
        userId: message.userId,
      });
    }

    return result;
  }

  remove(selector) {
    const messages = this.find(selector).fetch();
    const result = super.remove(selector);
    messageCountDenormalizer.afterRemoveMessages(messages);
    return result;
  }
}

export const Messages = new MessagesCollection('conversation_messages');

Messages.helpers({
  customer() {
    return Customers.findOne(this.customerId);
  },

  user() {
    return Meteor.users.findOne(this.userId);
  },
});

Messages.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

export const FormSchema = new SimpleSchema({
  // only required when there is no attachments
  content: {
    type: String,
    defaultValue: '',
    optional: true,
  },

  attachments: {
    type: [new SimpleSchema({
      url: { type: String },
      type: { type: String, optional: true },
      name: { type: String, optional: true },
      size: { type: Number, optional: true },
    })],

    optional: true,
  },

  conversationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },

  internal: {
    type: Boolean,
  },
});

const facebookSchema = new SimpleSchema({
  commentId: {
    type: String,
    optional: true,
  },

  // comment, reaction, etc ...
  item: {
    type: String,
    optional: true,
  },

  // when share photo
  photoId: {
    type: String,
    optional: true,
  },

  link: {
    type: String,
    optional: true,
  },

  reactionType: {
    type: String,
    optional: true,
  },

  senderId: {
    type: String,
    optional: true,
  },

  senderName: {
    type: String,
    optional: true,
  },
});

Messages.schema = new SimpleSchema([
  FormSchema,
  {
    customerId: {
      type: String,
      optional: true,
      regEx: SimpleSchema.RegEx.Id,
    },

    userId: {
      type: String,
      optional: true,
      regEx: SimpleSchema.RegEx.Id,
    },

    createdAt: {
      type: Date,
    },

    isCustomerRead: {
      type: Boolean,
      optional: true,
    },

    facebookData: {
      type: facebookSchema,
      optional: true,
    },
  },
]);

Messages.attachSchema(Messages.schema);

Messages.publicFields = {
  content: 1,
  attachments: 1,
  conversationId: 1,
  customerId: 1,
  userId: 1,
  createdAt: 1,
  facebookData: 1,
  internal: 1,
};

Factory.define('message', Messages, {
  content: () => faker.lorem.sentence(),
  conversationId: () => Random.id(),
  customerId: () => Random.id(),
  userId: () => Random.id(),
  internal: () => false,
});
