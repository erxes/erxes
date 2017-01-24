import faker from 'faker';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Customers } from '/imports/api/customers/customers';
import { Integrations } from '/imports/api/integrations/integrations';
import { Tags } from '/imports/api/tags/tags';

import { CONVERSATION_STATUSES, FACEBOOK_DATA_KINDS } from './constants';

class ConversationsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const conversation = _.extend(
      {
        createdAt: new Date(),
        number: this.find().count() + 1,
        messageCount: 0,
      },
      doc,
    );

    return super.insert(conversation, callback);
  }

  remove(selector, callback) {
    const conversations = this.find(selector).fetch();

    const result = super.remove(selector, callback);

    let removeIds = [];

    conversations.forEach((obj) => {
      removeIds.push(obj.tagIds || []);
    });

    removeIds = _.uniq(_.flatten(removeIds));

    // remove tag items that using removing conversations
    Tags.update({ _id: { $in: removeIds } }, { $inc: { objectCount: -1 } });

    return result;
  }
}

export const Conversations = new ConversationsCollection('conversations');

Conversations.TAG_TYPE = 'conversation';

Conversations.helpers({
  customer() {
    return Customers.findOne(this.customerId);
  },

  integration() {
    return Integrations.findOne(this.integrationId);
  },

  tags() {
    return Tags.find({ _id: { $in: this.tagIds || [] } }).fetch();
  },

  assignedUser() {
    return Meteor.users.findOne(this.assignedUserId);
  },

  participatedUsers() {
    const query = { _id: { $in: this.participatedUserIds || [] } };
    return Meteor.users.find(query).fetch();
  },

  participatorCount() {
    if (this.participatedUserIds) {
      return this.participatedUserIds.length;
    }

    return 0;
  },
});

export const addParticipator = ({ conversationId, userId }) => {
  if (conversationId && userId) {
    Conversations.update(
      conversationId,
      { $addToSet: { participatedUserIds: userId } },
    );
  }
};

Conversations.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

// twitter schemas ====================
const twitterDirectMessageSchema = new SimpleSchema({
  senderId: {
    type: Number,
  },

  senderIdStr: {
    type: String,
  },

  recipientId: {
    type: Number,
  },

  recipientIdStr: {
    type: String,
  },
});

const twitterSchema = new SimpleSchema({
  id: {
    type: Number,
    optional: true,
  },

  idStr: {
    type: String,
    optional: true,
  },

  screenName: {
    type: String,
    optional: true,
  },

  isDirectMessage: {
    type: Boolean,
  },

  directMessage: {
    type: twitterDirectMessageSchema,
    optional: true,
  },
});

// facebook schemas
const facebookSchema = new SimpleSchema({
  kind: {
    type: String,
    allowedValues: FACEBOOK_DATA_KINDS.ALL_LIST,
  },

  senderName: {
    type: String,
    optional: true,
  },

  senderId: {
    type: String,
  },

  recipientId: {
    type: String,
    optional: true,
  },

  // when wall post
  postId: {
    type: String,
    optional: true,
  },

  pageId: {
    type: String,
  },
});

Conversations.schema = new SimpleSchema({
  number: {
    type: Number,
  },

  content: {
    type: String,
  },

  customerId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },

  integrationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },

  twitterData: {
    type: twitterSchema,
    optional: true,
  },

  facebookData: {
    type: facebookSchema,
    optional: true,
  },

  assignedUserId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },

  status: {
    type: String,
    allowedValues: CONVERSATION_STATUSES.ALL_LIST,
  },

  participatedUserIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },

  tagIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },

  // users's informed history
  readUserIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },

  createdAt: {
    type: Date,
  },

  messageCount: {
    type: Number,
  },
});

Conversations.attachSchema(Conversations.schema);

// Helper schemas. Using in method checks
export const ConversationIdsSchema = new SimpleSchema({
  conversationIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
  },
});

export const AssignSchema = new SimpleSchema({
  conversationIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
  },

  assignedUserId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
});

export const ChangeStatusSchema = new SimpleSchema({
  conversationIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
  },
  status: {
    type: String,
    allowedValues: CONVERSATION_STATUSES.ALL_LIST,
  },
});

export const TagSchema = new SimpleSchema({
  conversationIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
  },
  tagIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
  },
});

Conversations.publicFields = {
  number: 1,
  assignedUserId: 1,
  content: 1,
  customerId: 1,
  integrationId: 1,
  status: 1,
  createdAt: 1,
  messageCount: 1,
  participatedUserIds: 1,
  facebookData: 1,
  readUserIds: 1,
  tagIds: 1,
};

Factory.define('conversation', Conversations, {
  content: () => faker.lorem.sentence(),
  customerId: () => Random.id(),
  integrationId: () => Factory.create('integration')._id,
  status: () => CONVERSATION_STATUSES.NEW,
});
