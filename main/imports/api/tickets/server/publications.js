import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';

import { Customers } from '/imports/api/customers/customers';
import { Tags } from '/imports/api/tags/tags';
import { Channels } from '/imports/api/channels/channels';
import { Brands } from '/imports/api/brands/brands';

import { Tickets } from '../tickets';
import { Comments } from '../comments';

import ListQueryBuilder from './queryBuilder';


Meteor.publishComposite('tickets.list', function ticketsList(params) {
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
    Counts.publish(this, name, Tickets.find(query), { noReady: true });
  };

  // all conversation count
  countPublish(
    'tickets.counts.allConversation',
    qb.buildMain()
  );

  // unassigned count
  countPublish(
    'tickets.counts.unassiged',
    _.extend({}, qb.mainQuery, qb.buildUnassigned())
  );

  // participating count
  countPublish(
    'tickets.counts.participating',
    _.extend({}, qb.mainQuery, qb.participatedUserFilter(user._id))
  );

  // starred count
  countPublish(
    'tickets.counts.starred',
    _.extend({}, qb.mainQuery, qb.buildStarred())
  );

  // resolved count
  countPublish(
    'tickets.counts.resolved',
    _.extend({}, qb.mainQuery, qb.statusFilter(['closed']))
  );

  // by brands
  Brands.find().forEach((brand) => {
    countPublish(
      `tickets.counts.byBrand${brand._id}`,
      _.extend({}, qb.mainQuery, qb.brandFilter(brand._id))
    );
  });

  // by tags
  Tags.find().forEach((tag) => {
    countPublish(
      `tickets.counts.byTag${tag._id}`,
      _.extend({}, qb.mainQuery, qb.tagFilter(tag._id))
    );
  });

  // by channels
  Channels.find().forEach((channel) => {
    countPublish(
      `tickets.counts.byChannel${channel._id}`,
      _.extend({}, qb.channelFilter(channel._id))
    );
  });

  return {
    find() {
      return Tickets.find(
        qb.mainFilter(),
        {
          fields: Tickets.publicField,
          sort: { createdAt: -1 },
        }
      );
    },

    children: [
      {
        find(ticket) {
          return Customers.find(
            ticket.customerId,
            { fields: Customers.publicFields }
          );
        },
      },
      {
        find(ticket) {
          return Meteor.users.find(
            ticket.assignedUserId,
            { fields: { details: 1, emails: 1 } }
          );
        },
      },
    ],
  };
});

Meteor.publishComposite('tickets.detail', function ticketsDetail(id) {
  check(id, String);

  if (! this.userId) {
    return { find() { this.ready(); } };
  }


  return {
    find() {
      return Tickets.find(id, { fields: Tickets.publicFields });
    },

    children: [
      {
        find(ticket) {
          return Customers.find(
            ticket.customerId,
            { fields: Customers.publicFields }
          );
        },
      },
      {
        find(ticket) {
          return Meteor.users.find(
            ticket.assignedUserId,
            { fields: { details: 1, emails: 1 } }
          );
        },
      },
    ],
  };
});

Meteor.publishComposite('tickets.commentList', function ticketsCommentList(ticketId) {
  check(ticketId, String);

  if (! this.userId) {
    return { find() { this.ready(); } };
  }

  return {
    find() {
      return Comments.find(
        { ticketId },
        { fields: Comments.publicFields }
      );
    },

    children: [
      {
        find(comment) {
          return Customers.find(
            comment.customerId,
            { fields: Customers.publicFields }
          );
        },
      },
      {
        find(comment) {
          return Meteor.users.find(
            comment.userId,
            { fields: { details: 1, emails: 1 } }
          );
        },
      },
    ],
  };
});
