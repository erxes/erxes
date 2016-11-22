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
import { Integrations } from '/imports/api/integrations/integrations';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';
import { KIND_CHOICES } from '/imports/api/integrations/constants';


// **************************** Helpers ********************** //

function checkConnection(conn) {
  return !conn || !conn._customerId || !conn._integrationId;
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
            'inAppMessagingData.isActive': false,
            'inAppMessagingData.lastSeenAt': new Date(),
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
    const brand = Brands.findOne({ code: param.brand_id }) || {};

    const integration = Integrations.findOne({
      brandId: brand._id,
      kind: KIND_CHOICES.IN_APP_MESSAGING,
    });

    if (!integration) {
      throw new Meteor.Error(
        'api.connect.integrationNotFound',
        'Integration not found'
      );
    }

    const data = _.omit(_.clone(param), 'brand_id');

    _.each(_.keys(data), (key) => {
      const value = data[key];

      // clear unwanted values
      if (!(
        // date
        (key.endsWith('_at') && _.isFinite(value)) ||

        // number
        (_.isFinite(value)) ||

        // string
        (_.isString(value))
       )) { delete data[key]; }
    });

    // find customer
    const customer = Customers.findOne({
      email: data.email,
      integrationId: integration._id,
    });

    let customerId;

    const now = new Date();
    const inAppMessagingData = {
      lastSeenAt: now,
      isActive: true,
      sessionCount: 1,
      customData: data,
    };

    if (customer) {
      customerId = customer._id;

      // update inAppMessagingData
      Customers.update(customer._id, { $set: { inAppMessagingData } });

      if ((now - customer.inAppMessagingData.lastSeenAt) > 30 * 60 * 1000) {
        // update session count
        Customers.update(
          customer._id,
          { $inc: { 'inAppMessagingData.sessionCount': 1 } }
        );
      }
    } else {
      // create new customer
      customerId = Customers.insert({
        email: data.email,
        name: data.name,
        integrationId: integration._id,
        inAppMessagingData,
      });
    }

    this.connection._customerId = customerId;
    this.connection._integrationId = integration._id;
  },
});

export const sendMessage = new ValidatedMethod({
  name: 'api.sendMessage',

  validate(doc) {
    check(doc, {
      message: String,
      attachments: Match.Optional([{
        url: String,
        name: String,
        size: Number,
        type: String,
      }]),
      conversationId: Match.Optional(String),
    });

    validateConnection(this.connection);
  },

  run(doc) {
    const customerId = this.connection._customerId;
    const integrationId = this.connection._integrationId;

    let conversation;
    let conversationId;

    if (!Customers.findOne(customerId)) {
      throw new Meteor.Error(
        'conversations.addConversation.customerNotFound',
        'Customer not found'
      );
    }

    // customer can write message to even closed conversation
    if (doc.conversationId) {
      conversationId = doc.conversationId;
      conversation = Conversations.findOne({ _id: conversationId });
    }

    if (conversation) {
      Conversations.update(
        { _id: conversation._id },
        {
          $set: {
            // empty read users list then it will be shown as unread again
            readUserIds: [],

            // if conversation is closed then reopen it.
            status: CONVERSATION_STATUSES.OPEN,
          },
        }
      );

    // create new conversation
    } else {
      conversationId = Conversations.insert({
        customerId,
        integrationId,
        content: doc.message,
        status: CONVERSATION_STATUSES.NEW,
      });
    }

    // create message
    const messageOptions = {
      conversationId,
      customerId,
      content: doc.message,
      internal: false,
    };

    if (doc.attachments) {
      messageOptions.attachments = doc.attachments;
    }

    return {
      // old or newly added conversation's id
      conversationId,

      // insert message
      messageId: Messages.insert(messageOptions),
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
          integrationId: conn._integrationId,
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
