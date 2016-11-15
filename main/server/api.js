/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */

import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { uploadFile } from '/imports/api/server/utils';
import { Brands } from '/imports/api/brands/brands';
import { Customers } from '/imports/api/customers/customers';
import { Comments } from '/imports/api/tickets/comments';
import { Tickets } from '/imports/api/tickets/tickets';
import { TICKET_STATUSES } from '/imports/api/tickets/constants';


// **************************** Helpers ********************** //

export function addTicket(data) {
  check(data, {
    content: String,
    customerId: String,
    brandId: String,
  });

  if (!Customers.findOne(data.customerId)) {
    throw new Meteor.Error(
      'tickets.addTicket.customerNotFound',
      'Customer not found'
    );
  }

  return Tickets.insert(
    _.extend(data, {
      status: TICKET_STATUSES.NEW,
    })
  );
}


const attachmentsChecker = {
  url: String,
  name: String,
  size: Number,
  type: String,
};

export function addComment(doc) {
  check(doc, {
    content: String,
    attachments: Match.Optional([attachmentsChecker]),
    customerId: String,
    ticketId: String,
  });

  const data = _.extend({ internal: false }, doc);

  if (!Tickets.findOne(doc.ticketId)) {
    throw new Meteor.Error(
      'tickets.addComment.ticketNotFound',
      'Ticket not found'
    );
  }

  if (!Customers.findOne(data.customerId)) {
    throw new Meteor.Error(
      'tickets.addComment.customerNotFound',
      'Customer not found'
    );
  }

  return Comments.insert(data);
}

function checkConnection(conn) {
  return !conn || !conn._customerId || !conn._brandId;
}

function validateConnection(conn) {
  if (checkConnection(conn)) {
    throw new Meteor.Error(
      'api.connection.connectionRequired',
      'Connection required'
    );
  }
}

Meteor.onConnection((conn) => {
  conn.onClose(() => {
    if (conn._customerId) {
      // mark as not active when connection close
      Customers.update(
        conn._customerId,
        {
          $set: {
            isActive: false,
            lastSeenAt: new Date(),
          },
        }
      );
    }
  });
});


// **************************** Public methods ********************** //


export const connect = new ValidatedMethod({
  name: 'api.connect',

  validate(param) {
    check(param, Object);
    check(param.brand_id, String);

    check(
      param.email,

      Match.Where(
        (e) => SimpleSchema.RegEx.Email.test(e)
      )
    );

    if (!this.connection) {
      throw new Meteor.Error(
        'api.connect.connectionRequired',
        'Connection required'
      );
    }
  },

  run(param) {
    const brand = Brands.findOne({ code: param.brand_id });

    if (!brand) {
      throw new Meteor.Error('api.connect.brandNotFound', 'Brand not found');
    }

    const schema = {};
    const data = _.clone(param);

    _.each(_.keys(data), (key) => {
      const value = data[key];

      if (key.endsWith('_at') && _.isFinite(value)) {
        schema[key] = 'date';
      } else if (_.isFinite(value)) {
        schema[key] = 'number';
      } else if (_.isString(value)) {
        schema[key] = 'string';
      } else {
        delete data[key];
      }
    });

    Brands.update(brand._id, { $set: { schema } });

    const filter = { email: data.email, brandId: brand._id };
    const customer = Customers.findOne(filter);
    let customerId;

    const obj = {
      email: data.email,
      name: data.name,
      brandId: brand._id,
      lastSeenAt: new Date(),
      isActive: true,
      data: _.omit(data, 'brand_id'),
    };

    if (customer) {
      customerId = customer._id;

      const modifier = { $set: obj };
      if ((obj.lastSeenAt - customer.lastSeenAt) > 30 * 60 * 1000) {
        modifier.$inc = { sessionCount: 1 };
      }

      Customers.update(customer._id, modifier);
    } else {
      obj.sessionCount = 1;
      customerId = Customers.insert(obj);
    }

    this.connection._customerId = customerId;
    this.connection._brandId = brand._id;
  },
});

export const sendMessage = new ValidatedMethod({
  name: 'api.sendMessage',

  validate(doc) {
    check(doc, {
      message: String,
      attachments: Match.Optional([attachmentsChecker]),
      ticketId: Match.Optional(String),
    });

    validateConnection(this.connection);
  },

  run(doc) {
    const customerId = this.connection._customerId;
    const brandId = this.connection._brandId;

    let ticket;
    let ticketId;

    // customer can write message to even closed ticket
    if (doc.ticketId) {
      ticketId = doc.ticketId;
      ticket = Tickets.findOne({ _id: ticketId });
    }

    if (ticket) {
      // empty read users list then it will be shown as unread again
      Tickets.update({ _id: ticket._id }, { $set: { readUserIds: [] } });

    // create new ticket
    } else {
      ticketId = addTicket({
        customerId,
        brandId,
        content: doc.message,
      });
    }

    // create comment
    const commentOptions = {
      ticketId,
      customerId,
      content: doc.message,
    };

    if (doc.attachments) {
      commentOptions.attachments = doc.attachments;
    }

    return {
      // old or newly added ticket's id
      conversationId: ticketId,

      // insert comment
      messageId: addComment(commentOptions),
    };
  },
});


export const sendFile = new ValidatedMethod({
  name: 'api.sendFile',

  validate({ name, data }) {
    check(name, String);
    check(data, Match.Any);

    validateConnection(this.connection);
  },

  run(doc) {
    return uploadFile(doc);
  },
});


// mark given conversation's message as read
export const customerReadMessages = new ValidatedMethod({
  name: 'api.customerReadMessages',

  validate(conversationId) {
    check(conversationId, String);

    validateConnection(this.connection);
  },

  run(conversationId) {
    return Comments.update(
      {
        ticketId: conversationId,
        userId: { $exists: true },
        isCustomerRead: { $exists: false },
      },
      { $set: { isCustomerRead: true } },
      { multi: true }
    );
  },
});

// **************************** publications ********************** //

Meteor.publishComposite('api.conversations', function conversations() {
  const conn = this.connection;

  if (checkConnection(conn)) {
    return this.ready();
  }

  return {
    find() {
      // find current users tickets
      return Tickets.find(
        { customerId: conn._customerId },
        { fields: Tickets.publicFields }
      );
    },

    children: [
      {
        // publish every ticket's unread count
        find(ticket) {
          const cursor = Comments.find({
            ticketId: ticket._id,
            userId: { $exists: true },
            isCustomerRead: { $exists: false },
          });

          Counts.publish(
            this, `unreadCommentsCount_${ticket._id}`, cursor, { noReady: true });

          return null;
        },
      },
    ],
  };
});


Meteor.publishComposite('api.messages', function apiMessages(ticketId) {
  check(ticketId, Match.Maybe(String));

  if (checkConnection(this.connection)) {
    return { find() { this.ready(); } };
  }

  return {
    find() {
      return Comments.find(
        { ticketId,
          internal: false,
        },
        {
          sort: { createdAt: 1 },
          fields: Comments.publicFields,
        }
      );
    },

    children: [
      {
        find(comment) {
          return Meteor.users.find(
            comment.userId,
            { fields: { details: 1 } }
          );
        },
      },
    ],
  };
});


// **************************** rate limitter ********************** //


// Get list of all method names on Api
const METHOD_NAMES = _.pluck([
  connect,
  sendMessage,
  sendFile,
], 'name');

// Only allow 5 todos operations per connection per second
DDPRateLimiter.addRule({
  name(name) {
    return _.contains(METHOD_NAMES, name);
  },

  // Rate limit per connection ID
  connectionId() { return true; },
}, 5, 1000);
