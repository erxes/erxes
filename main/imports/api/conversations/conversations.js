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

import { CONVERSATION_STATUSES } from './constants';

class ConversationsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const conversation = _.extend(
      {
        createdAt: new Date(),
        number: this.find().count() + 1,
        messageCount: 0,
      },
      doc
    );

    return super.insert(conversation, callback);
  }

  update(selector, modifier, options) {
    const set = modifier.$set || {};

    if (set.number) {
      throw new Meteor.Error('invalid-data', 'Can\'t change "number" field!');
    }

    return super.update(selector, modifier, options);
  }

  remove(selector, callback) {
    const conversations = this.find(selector).fetch();

    const result = super.remove(selector, callback);

    let removeIds = [];
    conversations.forEach((obj) => {
      removeIds.push(obj.tagIds || []);
    });

    removeIds = _.uniq(_.flatten(removeIds));
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
    return this.participatedUserIds && this.participatedUserIds.length || 0;
  },
});

export function addParticipator({ conversationId, userId }) {
  if (conversationId && userId) {
    Conversations.update(
      conversationId,
      { $addToSet: { participatedUserIds: userId } }
    );
  }
}

Conversations.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

const twitterSchema = new SimpleSchema({
  id: {
    type: Number,
  },

  idStr: {
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
  readUserIds: 1,
  tagIds: 1,
};

Factory.define('conversation', Conversations, {
  content: () => faker.lorem.sentence(),
  customerId: () => Random.id(),
  integrationId: () => Random.id(),
  status: () => CONVERSATION_STATUSES.NEW,
});
