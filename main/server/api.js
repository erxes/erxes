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
import { Messages } from '/imports/api/conversations/messages';
import { Conversations } from '/imports/api/conversations/conversations';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';


// **************************** Helpers ********************** //

export function addConversation(data) {
  check(data, {
    content: String,
    customerId: String,
    brandId: String,
  });

  if (!Customers.findOne(data.customerId)) {
    throw new Meteor.Error(
      'conversations.addConversation.customerNotFound',
      'Customer not found'
    );
  }

  return Conversations.insert(
    _.extend(data, {
      status: CONVERSATION_STATUSES.NEW,
    })
  );
}


const attachmentsChecker = {
  url: String,
  name: String,
  size: Number,
  type: String,
};

export function addMessage(doc) {
  check(doc, {
    content: String,
    attachments: Match.Optional([attachmentsChecker]),
    customerId: String,
    conversationId: String,
  });

  const data = _.extend({ internal: false }, doc);

  if (!Conversations.findOne(doc.conversationId)) {
    throw new Meteor.Error(
      'conversations.addMessage.conversationNotFound',
      'Conversation not found'
    );
  }

  if (!Customers.findOne(data.customerId)) {
    throw new Meteor.Error(
      'conversations.addMessage.customerNotFound',
      'Customer not found'
    );
  }

  return Messages.insert(data);
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
      conversationId: Match.Optional(String),
    });

    validateConnection(this.connection);
  },

  run(doc) {
    const customerId = this.connection._customerId;
    const brandId = this.connection._brandId;

    let conversation;
    let conversationId;

    // customer can write message to even closed conversation
    if (doc.conversationId) {
      conversationId = doc.conversationId;
      conversation = Conversations.findOne({ _id: conversationId });
    }

    if (conversation) {
      // empty read users list then it will be shown as unread again
      Conversations.update({ _id: conversation._id }, { $set: { readUserIds: [] } });

    // create new conversation
    } else {
      conversationId = addConversation({
        customerId,
        brandId,
        content: doc.message,
      });
    }

    // create message
    const messageOptions = {
      conversationId,
      customerId,
      content: doc.message,
    };

    if (doc.attachments) {
      messageOptions.attachments = doc.attachments;
    }

    return {
      // old or newly added conversation's id
      conversationId,

      // insert message
      messageId: addMessage(messageOptions),
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
    return Messages.update(
      {
        conversationId,
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
      // find current users conversations
      return Conversations.find(
        {
          brandId: conn._brandId,
          customerId: conn._customerId,
        },
        { fields: Conversations.publicFields }
      );
    },

    children: [
      {
        // publish every conversation's unread count
        find(conversation) {
          const cursor = Messages.find({
            conversationId: conversation._id,
            userId: { $exists: true },
            isCustomerRead: { $exists: false },
          });

          Counts.publish(
            this, `unreadMessagesCount_${conversation._id}`, cursor, { noReady: true });

          return null;
        },
      },
    ],
  };
});


Meteor.publishComposite('api.messages', function apiMessages(conversationId) {
  check(conversationId, Match.Maybe(String));

  if (checkConnection(this.connection)) {
    return { find() { this.ready(); } };
  }

  return {
    find() {
      return Messages.find(
        { conversationId,
          internal: false,
        },
        {
          sort: { createdAt: 1 },
          fields: Messages.publicFields,
        }
      );
    },

    children: [
      {
        find(message) {
          return Meteor.users.find(
            message.userId,
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
