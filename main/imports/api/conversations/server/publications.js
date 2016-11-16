import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';

import { Customers } from '/imports/api/customers/customers';
import { Tags } from '/imports/api/tags/tags';
import { Channels } from '/imports/api/channels/channels';
import { Brands } from '/imports/api/brands/brands';

import { Conversations } from '../conversations';
import { Messages } from '../messages';

import ListQueryBuilder from './queryBuilder';


Meteor.publishComposite('conversations.list', function conversationsList(params) {
  check(params, Object);

  if (!this.userId) {
    return { find() { this.ready(); } };
  }

  const user = Meteor.users.findOne(this.userId);

  // query builder
  const qb = new ListQueryBuilder(params, user);

  // check params
  qb.checkParams();

  const countPublish = (name, query) => {
    Counts.publish(this, name, Conversations.find(query), { noReady: true });
  };

  // all conversation count
  countPublish(
    'conversations.counts.allConversation',
    qb.buildMain()
  );

  // unassigned count
  countPublish(
    'conversations.counts.unassiged',
    _.extend({}, qb.mainQuery, qb.buildUnassigned())
  );

  // participating count
  countPublish(
    'conversations.counts.participating',
    _.extend({}, qb.mainQuery, qb.participatedUserFilter(user._id))
  );

  // starred count
  countPublish(
    'conversations.counts.starred',
    _.extend({}, qb.mainQuery, qb.buildStarred())
  );

  // resolved count
  countPublish(
    'conversations.counts.resolved',
    _.extend({}, qb.mainQuery, qb.statusFilter(['closed']))
  );

  // by brands
  Brands.find().forEach((brand) => {
    countPublish(
      `conversations.counts.byBrand${brand._id}`,
      _.extend({}, qb.mainQuery, qb.brandFilter(brand._id))
    );
  });

  // by tags
  Tags.find().forEach((tag) => {
    countPublish(
      `conversations.counts.byTag${tag._id}`,
      _.extend({}, qb.mainQuery, qb.tagFilter(tag._id))
    );
  });

  // by channels
  Channels.find().forEach((channel) => {
    countPublish(
      `conversations.counts.byChannel${channel._id}`,
      _.extend({}, qb.channelFilter(channel._id))
    );
  });

  return {
    find() {
      return Conversations.find(
        qb.mainFilter(),
        {
          fields: Conversations.publicField,
          sort: { createdAt: -1 },
        }
      );
    },

    children: [
      {
        find(conversation) {
          return Customers.find(
            conversation.customerId,
            { fields: Customers.publicFields }
          );
        },
      },
      {
        find(conversation) {
          return Meteor.users.find(
            conversation.assignedUserId,
            { fields: { details: 1, emails: 1 } }
          );
        },
      },
    ],
  };
});

Meteor.publishComposite('conversations.detail', function conversationsDetail(id) {
  check(id, String);

  if (! this.userId) {
    return { find() { this.ready(); } };
  }


  return {
    find() {
      return Conversations.find(id, { fields: Conversations.publicFields });
    },

    children: [
      {
        find(conversation) {
          return Customers.find(
            conversation.customerId,
            { fields: Customers.publicFields }
          );
        },
      },
      {
        find(conversation) {
          return Meteor.users.find(
            conversation.assignedUserId,
            { fields: { details: 1, emails: 1 } }
          );
        },
      },
    ],
  };
});

Meteor.publishComposite('conversations.messageList', function messageList(conversationId) {
  check(conversationId, String);

  if (! this.userId) {
    return { find() { this.ready(); } };
  }

  return {
    find() {
      return Messages.find(
        { conversationId },
        { fields: Messages.publicFields }
      );
    },

    children: [
      {
        find(message) {
          return Customers.find(
            message.customerId,
            { fields: Customers.publicFields }
          );
        },
      },
      {
        find(message) {
          return Meteor.users.find(
            message.userId,
            { fields: { details: 1, emails: 1 } }
          );
        },
      },
    ],
  };
});
