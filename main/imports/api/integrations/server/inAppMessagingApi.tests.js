/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */

import faker from 'faker';

import { Meteor } from 'meteor/meteor';
import { DDP } from 'meteor/ddp-client';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Factory } from 'meteor/dburles:factory';
import { assert, chai } from 'meteor/practicalmeteor:chai';

import { Customers } from '/imports/api/customers/customers';
import { Integrations } from '/imports/api/integrations/integrations';
import { Brands } from '/imports/api/brands/brands';
import { Conversations } from '/imports/api/conversations/conversations';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';

import { Messages } from '/imports/api/conversations/messages';

import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { connect, sendMessage } from './inAppMessagingApi';

describe('API', function () {
  describe('connect', function () {
    let connection;
    let integrationId;
    let code;

    before(function () {
      // clear previous data
      Customers.remove({});
      Integrations.remove({});
      Brands.remove({});

      connection = DDP.connect(Meteor.absoluteUrl());

      // create brand
      const brand = Factory.create('brand');
      code = brand.code;

      // create integration
      integrationId = Factory.create(
        'integration',
        {
          brandId: brand._id,
          kind: KIND_CHOICES.IN_APP_MESSAGING,
        }
      )._id;
    });

    it('integration not found', function () {
      assert.throws(() => {
        connection.call(connect.name, {
          brand_id: Random.id(),
          email: faker.internet.email(),
        });
      }, Meteor.Error, /api.connect.integrationNotFound/);
    });

    it('connect', function () {
      chai.assert.equal(Customers.find().count(), 0);

      const email = faker.internet.email();
      let name = faker.internet.userName();

      // firs call
      connection.call(connect.name, {
        brand_id: code,
        email,
        name,
        plan: 2,
      });

      // must be created customer
      chai.assert.equal(Customers.find().count(), 1);

      const customer = Customers.findOne();

      let inAppMessagingData = customer.inAppMessagingData;

      // check customer fields
      chai.assert.equal(customer.email, email);
      chai.assert.equal(customer.name, name);
      chai.assert.equal(customer.integrationId, integrationId);
      chai.assert.equal(customer.integrationId, integrationId);
      chai.assert.equal(inAppMessagingData.isActive, true);
      chai.assert.equal(inAppMessagingData.sessionCount, 1);
      chai.assert.deepEqual(inAppMessagingData.customData, {
        email,
        name,
        plan: 2,
      });

      // second call
      name = faker.internet.userName();

      connection.call(connect.name, {
        brand_id: code,
        email,
        name,
        plan: 3,
      });

      // must use old customer
      chai.assert.equal(Customers.find().count(), 1);

      const updatedCustomer = Customers.findOne();
      inAppMessagingData = updatedCustomer.inAppMessagingData;

      // customData must be updated
      chai.assert.equal(inAppMessagingData.customData.email, email);
      chai.assert.equal(inAppMessagingData.customData.name, name);
      chai.assert.equal(inAppMessagingData.customData.plan, 3);
    });

    it('connection required', function () {
      assert.throws(() => {
        connect._execute({}, {
          brand_id: Random.id(),
          email: faker.internet.email(),
        });
      }, Meteor.Error, /api.connect.connectionRequired/);
    });

    after(function () {
      connection.close();
    });
  });

  describe('sendMessage', function () {
    let connection;

    before(function () {
      // clear previous data
      Customers.remove({});
      Conversations.remove({});
      Integrations.remove({});
      Brands.remove({});
      Messages.remove({});

      connection = DDP.connect(Meteor.absoluteUrl());

      const brand = Factory.create('brand');
      const code = brand.code;

      // create integration
      Factory.create(
        'integration',
        {
          brandId: brand._id,
          kind: KIND_CHOICES.IN_APP_MESSAGING,
        }
      );

      connection.call(connect.name, {
        brand_id: code,
        email: faker.internet.email(),
      });
    });

    it('send message', function () {
      // ================== first call
      connection.call(sendMessage.name, { message: 'hello' });

      // must be create 1 conversation, 1 message
      chai.assert.equal(Conversations.find().count(), 1);
      chai.assert.equal(Messages.find().count(), 1);

      let conversation = Conversations.findOne();
      const customer = Customers.findOne();
      const integration = Integrations.findOne();

      // check conversation fields
      chai.assert.equal(conversation.customerId, customer._id);
      chai.assert.equal(conversation.integrationId, integration._id);
      chai.assert.equal(conversation.content, 'hello');
      chai.assert.equal(conversation.status, CONVERSATION_STATUSES.NEW);

      const message = Messages.findOne();

      // check message fields
      chai.assert.equal(message.conversationId, conversation._id);
      chai.assert.equal(message.content, 'hello');
      chai.assert.equal(message.internal, false);

      // ================ second call
      connection.call(
        sendMessage.name,
        {
          message: 'hello again',
          conversationId: conversation._id,
        }
      );

      // must not be created conversation
      chai.assert.equal(Conversations.find().count(), 1);

      // must be created 1 message again
      chai.assert.equal(Messages.find().count(), 2);

      conversation = Conversations.findOne();

      // open and unread
      chai.assert.equal(conversation.readUserIds.length, 0);
      chai.assert.equal(conversation.status, CONVERSATION_STATUSES.OPEN);
    });

    it('connection required', function () {
      assert.throws(() => {
        sendMessage._execute({}, { message: 'hello' });
      }, Meteor.Error, /api.connection.connectionRequired/);
    });

    after(function () {
      connection.close();
    });
  });

  describe('rate limiting', function () {
    it('does not allow more than 5 operations rapidly', function () {
      const connection = DDP.connect(Meteor.absoluteUrl());

      _.times(5, () => {
        assert.throws(() => {
          connection.call(connect.name, {
            brand_id: Random.id(),
            email: faker.internet.email(),
          });
        }, Meteor.Error, /api.connect.integrationNotFound/);
      });

      assert.throws(() => {
        connection.call(connect.name, {});
      }, Meteor.Error, /too-many-requests/);

      connection.disconnect();
    });
  });
});
