import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';

import { Customers } from '/imports/api/customers/customers';
import { Tags } from '/imports/api/tags/tags';
import { Channels } from '/imports/api/channels/channels';
import { Brands } from '/imports/api/brands/brands';
import { KIND_CHOICES } from '/imports/api/integrations/constants';

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

  const queries = qb.queries;

  const countPublish = (name, query) => {
    Counts.publish(this, name, Conversations.find(query), { noReady: true });
  };

  // by channels
  Channels.find().forEach((channel) => {
    countPublish(
      `conversations.counts.byChannel${channel._id}`,
      _.extend({}, queries.default, qb.channelFilter(channel._id)),
    );
  });

  // by brands
  Brands.find().forEach((brand) => {
    countPublish(
      `conversations.counts.byBrand${brand._id}`,
      _.extend(
        {},
        queries.default,
        qb.intersectIntegrationIds(queries.channel, qb.brandFilter(brand._id)),
      ),
    );
  });

  // unassigned count
  countPublish(
    'conversations.counts.unassiged',
    _.extend(
      {}, queries.default, queries.integrations,
      queries.integrationType, qb.unassignedFilter(),
    ),
  );

  // participating count
  countPublish(
    'conversations.counts.participating',
    _.extend(
      {}, queries.default, queries.integrations,
      queries.integrationType, qb.participatingFilter(),
    ),
  );

  // starred count
  countPublish(
    'conversations.counts.starred',
    _.extend(
      {}, queries.default, queries.integrations,
      queries.integrationType, qb.starredFilter(),
    ),
  );

  // resolved count
  countPublish(
    'conversations.counts.resolved',
    _.extend(
      {}, queries.default, queries.integrations,
      queries.integrationType, qb.statusFilter(['closed']),
    ),
  );

  // by integration type
  _.each(KIND_CHOICES.ALL_LIST, (integrationType) => {
    countPublish(
      `conversations.counts.byIntegrationType${integrationType}`,
      _.extend({}, queries.default, qb.integrationTypeFilter(integrationType)),
    );
  });

  // by tag
  Tags.find().forEach((tag) => {
    countPublish(
      `conversations.counts.byTag${tag._id}`,
      _.extend(
        {}, queries.default, queries.integrations,
        queries.integrationType, qb.tagFilter(tag._id),
      ),
    );
  });

  return {
    find() {
      return Conversations.find(
        qb.mainQuery(),
        {
          fields: Conversations.publicField,
          sort: { createdAt: -1 },
        },
      );
    },

    children: [
      {
        find(conversation) {
          return Customers.find(
            conversation.customerId,
            { fields: Customers.publicFields },
          );
        },
      },
      {
        find(conversation) {
          return Meteor.users.find(
            conversation.assignedUserId,
            { fields: { details: 1, emails: 1 } },
          );
        },
      },
    ],
  };
});

Meteor.publishComposite('conversations.detail', function conversationsDetail(id) {
  check(id, String);

  if (!this.userId) {
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
            { fields: Customers.publicFields },
          );
        },
      },
      {
        find(conversation) {
          return Meteor.users.find(
            conversation.assignedUserId,
            { fields: { details: 1, emails: 1 } },
          );
        },
      },
    ],
  };
});

Meteor.publishComposite('conversations.messageList', function messageList(conversationId) {
  check(conversationId, String);

  if (!this.userId) {
    return { find() { this.ready(); } };
  }

  return {
    find() {
      return Messages.find(
        { conversationId },
        { fields: Messages.publicFields },
      );
    },

    children: [
      {
        find(message) {
          return Customers.find(
            message.customerId,
            { fields: Customers.publicFields },
          );
        },
      },
      {
        find(message) {
          return Meteor.users.find(
            message.userId,
            { fields: { details: 1, emails: 1 } },
          );
        },
      },
    ],
  };
});
