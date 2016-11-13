import faker from 'faker';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Customers } from '/imports/api/customers/customers';
import commentCountDenormalizer from './commentCountDenormalizer.js';

import { addParticipator } from './tickets';

class CommentsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const comment = _.extend({ createdAt: new Date() }, doc);

    const result = super.insert(comment, callback);

    commentCountDenormalizer.afterInsertComment(comment);

    if (comment.userId) {
      addParticipator({
        ticketId: comment.ticketId,
        userId: comment.userId,
      });
    }

    return result;
  }

  remove(selector) {
    const comments = this.find(selector).fetch();
    const result = super.remove(selector);
    commentCountDenormalizer.afterRemoveComments(comments);
    return result;
  }
}

export const Comments = new CommentsCollection('ticket_comments');

Comments.helpers({
  customer() {
    return Customers.findOne(this.customerId);
  },

  user() {
    return Meteor.users.findOne(this.userId);
  },
});

Comments.deny({
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
      name: { type: String },
      size: { type: Number },
      type: { type: String },
    })],

    optional: true,
  },

  ticketId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },

  internal: {
    type: Boolean,
  },
});

Comments.schema = new SimpleSchema([
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
  },
]);

Comments.attachSchema(Comments.schema);

Comments.publicFields = {
  content: 1,
  attachments: 1,
  ticketId: 1,
  customerId: 1,
  userId: 1,
  createdAt: 1,
  internal: 1,
};

Factory.define('comment', Comments, {
  content: () => faker.lorem.sentence(),
  ticketId: () => Random.id(),
  customerId: () => Random.id(),
  userId: () => Random.id(),
  internal: () => false,
});
