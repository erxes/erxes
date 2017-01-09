/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import { Factory } from 'meteor/dburles:factory';
import { assert, chai } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/publication-collector';
import { Notifications } from 'meteor/erxes-notifications';

import { Channels } from '/imports/api/channels/channels';
import { Brands } from '/imports/api/brands/brands';
import { Integrations } from '/imports/api/integrations/integrations';

import { Conversations } from './conversations';
import { CONVERSATION_STATUSES } from './constants';
import { assign, unassign, changeStatus, star, unstar } from './methods';

if (Meteor.isServer) {
  const { tag } = require('./server/methods');

  require('./server/publications');

  describe('conversations', function () {
    describe('publications', function () {
      let userId;
      let tagId;

      const createConversations = (channelName, count, conversationOptions = {}) => {
        const brandId = Factory.create('brand')._id;
        const integrationId = Factory.create('integration', { brandId })._id;

        Factory.create(
          'channel',
          {
            name: channelName,
            memberIds: [userId],
            integrationIds: [integrationId],
          }
        );

        _.extend(conversationOptions, { integrationId });

        return _.times(count, () => Factory.create(
          'conversation',
          conversationOptions
        )._id);
      };

      const checkCollectionLength = (done, options, length) => {
        const collector = new PublicationCollector({ userId });

        collector.collect('conversations.list', options, (collections) => {
          chai.assert.notEqual(collections.conversations, undefined);
          chai.assert.equal(collections.conversations.length, length);
          done();
        });
      };

      before(function () {
        Conversations.remove({});
        Brands.remove({});
        Integrations.remove({});
        Channels.remove({});

        // create login user
        userId = Factory.create('user')._id;

        // assigned && participated 2
        createConversations(
          'sales',
          2,
          { participatedUserIds: [userId], assignedUserId: userId }
        );

        // assigned && starred 3
        const starredConversationIds = createConversations(
          'support',
          3,
          { assignedUserId: userId, starred: CONVERSATION_STATUSES.OPEN }
        );

        Meteor.users.update(
          userId,
          { $set: { 'details.starredConversationIds': starredConversationIds } }
        );

        // unassigned && tagged 4
        tagId = Factory.create('tag', { type: Conversations.TAG_TYPE })._id;

        createConversations('management', 4, { tagIds: [tagId] });

        // closed 3
        createConversations(
          'specialSales',
          3,
          { assignedUserId: userId, status: 'closed' }
        );
      });

      describe('conversations.list', function () {
        it('sends all open/new conversations', function (done) {
          // 2 + 3 + 4, ignored closed 3
          checkCollectionLength(done, {}, 9);
        });

        it('filter by channel', function (done) {
          const channelId = Channels.findOne({ name: 'sales' })._id;

          checkCollectionLength(done, { channelId }, 2);
        });

        it('filter by status', function (done) {
          checkCollectionLength(done, { status: 'closed' }, 3);
        });

        it('filter by assignee', function (done) {
          // 2 + 3
          checkCollectionLength(done, { assignedUserId: userId }, 5);

          checkCollectionLength(
            done,
            {
              status: 'closed',
              assignedUserId: userId,
            },
            3
          );
        });

        it('get unassigned conversations', function (done) {
          checkCollectionLength(done, { assignedUserId: userId }, 5);
          checkCollectionLength(done, { unassigned: '1' }, 4);
        });

        it('filter by tags', function (done) {
          checkCollectionLength(done, { unassigned: '1', tagId }, 4);
        });

        it('filter by participator', function (done) {
          checkCollectionLength(
            done,
            { assignedUserId: userId, participatedUserId: userId },
            2
          );
        });

        it('filter by starred', function (done) {
          checkCollectionLength(
            done,
            { assignedUserId: userId, starred: '1' },
            3
          );
        });

        it('do not send conversations without user', function (done) {
          const collector = new PublicationCollector();
          collector.collect('conversations.list', {}, (collections) => {
            chai.assert.equal(collections.conversations, undefined);
            done();
          });
        });
      });

      describe('conversations.detail', function () {
        it('sends conversation detail by id', function (done) {
          const conversationId = Conversations.findOne()._id;

          const collector = new PublicationCollector({ userId });
          collector.collect('conversations.detail', conversationId, (collections) => {
            chai.assert.equal(collections.conversations.length, 1);
            done();
          });
        });

        it('do not send conversation without user', function (done) {
          const conversationId = Conversations.findOne()._id;

          const collector = new PublicationCollector();
          collector.collect('conversations.detail', conversationId, (collections) => {
            chai.assert.equal(collections.conversations, undefined);
            done();
          });
        });
      });
    });

    describe('methods', function () {
      let userId;

      beforeEach(function () {
        // Clear
        Conversations.remove({});
        Notifications.remove({});

        userId = Factory.create('user')._id;
      });

      describe('assign', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            assign._execute(
              {},
              { assignedUserId: Random.id(), conversationIds: [Random.id()] }
            );
          }, Meteor.Error, /loginRequired/);
        });

        it('conversation must exist', function () {
          assert.throws(() => {
            assign._execute(
              { userId },
              { assignedUserId: Random.id(), conversationIds: [Random.id()] }
            );
          }, Meteor.Error, /conversations.assign.conversationNotFound/);
        });

        it('user must exist', function () {
          const conversationIds = [Factory.create('conversation')._id];

          assert.throws(() => {
            assign._execute(
              { userId },
              { assignedUserId: Random.id(), conversationIds }
            );
          }, Meteor.Error, /conversations.assign.userNotFound/);
        });

        it('assign', function () {
          const assignedUserId = Factory.create('user')._id;
          Factory.create('channel', { memberIds: [assignedUserId, userId] });

          const conversationIds = [
            Factory.create('conversation')._id,
            Factory.create('conversation')._id,
          ];

          // notifications must not send yet
          assert.equal(Notifications.find().count(), 0);

          assign._execute({ userId }, { assignedUserId, conversationIds });

          assert.equal(
            Conversations.findOne(conversationIds[0]).assignedUserId,
            assignedUserId
          );

          assert.equal(
            Conversations.findOne(conversationIds[1]).assignedUserId,
            assignedUserId

          );

          // assigned users must received notification
          assert.equal(
            Notifications.find({ receiver: assignedUserId }).count(), 2
          );

          const notif = Notifications.findOne({ receiver: assignedUserId });

          assert.equal(notif.notifType, 'conversationAssigneeChange');
          assert.equal(notif.receiver, assignedUserId);
        });
      });

      describe('unassign', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            unassign._execute({}, { conversationIds: [Random.id()] });
          }, Meteor.Error, /loginRequired/);
        });

        it('conversation must exist', function () {
          assert.throws(() => {
            unassign._execute({ userId }, { conversationIds: [Random.id()] });
          }, Meteor.Error, /conversations.unassign.conversationNotFound/);
        });

        it('unassign', function () {
          Factory.create('channel', { memberIds: [userId] });
          const assignedUserId = Random.id();

          const conversationIds = [
            Factory.create('conversation', { assignedUserId })._id,
            Factory.create('conversation', { assignedUserId })._id,
          ];

          assert.equal(
            Conversations.findOne(conversationIds[0]).assignedUserId,
            assignedUserId
          );

          assert.equal(
            Conversations.findOne(conversationIds[1]).assignedUserId,
            assignedUserId
          );

          unassign._execute({ userId }, { conversationIds });

          assert.equal(
            Conversations.findOne(conversationIds[0]).assignedUserId,
            undefined
          );

          assert.equal(
            Conversations.findOne(conversationIds[1]).assignedUserId,
            undefined
          );
        });
      });

      describe('change status', function () {
        const randomData = {
          conversationIds: [Random.id()],
          status: CONVERSATION_STATUSES.CLOSED,
        };

        it('only works if you are logged in', function () {
          assert.throws(() => {
            changeStatus._execute({}, randomData);
          }, Meteor.Error, /loginRequired/);
        });

        it('conversation must exist', function () {
          assert.throws(() => {
            changeStatus._execute({ userId }, randomData);
          }, Meteor.Error, /conversations.changeStatus.conversationNotFound/);
        });

        it('wrong status', function () {
          const conversationId = Factory.create('conversation')._id;

          assert.throws(() => {
            changeStatus._execute(
              { userId },
              { status: 'foo', conversationIds: [conversationId] }
            );
          }, Meteor.Error, /validation-error/);
        });

        it('change status', function () {
          const participatedUserId = Factory.create('user')._id;
          const participatedUserIds = [participatedUserId];

          const status = CONVERSATION_STATUSES.CLOSED;
          Factory.create('channel', { memberIds: [userId] });

          const conversation = Factory.create('conversation',
            { status: CONVERSATION_STATUSES.OPEN, participatedUserIds });

          const conversation2Id = Factory.create('conversation',
            { status: CONVERSATION_STATUSES.OPEN, participatedUserIds })._id;

          assert.equal(conversation.status, CONVERSATION_STATUSES.OPEN);

          // notifications must not send yet
          assert.equal(Notifications.find().count(), 0);

          // execute method
          changeStatus._execute(
            { userId },
            { status, conversationIds: [conversation2Id, conversation._id] }
          );

          assert.equal(Conversations.findOne(conversation._id).status, status);

          // participated users must received notification
          const notif = Notifications.findOne({ receiver: participatedUserId });

          assert.equal(notif.notifType, 'conversationStateChange');
          assert.equal(notif.receiver, participatedUserId);
        });
      });

      describe('tag', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            tag._execute(
              {},
              { conversationIds: [Random.id()], tagIds: [Random.id()] }
            );
          }, Meteor.Error, /loginRequired/);
        });

        it('conversation must exist', function () {
          assert.throws(() => {
            tag._execute(
              { userId },
              { conversationIds: [Random.id()], tagIds: [Random.id()] }
            );
          }, Meteor.Error, /conversations.tag.conversationNotFound/);
        });

        it('tag', function () {
          Factory.create('channel', { memberIds: [userId] });
          const tagIds = [Factory.create('tag', { type: Conversations.TAG_TYPE })._id];

          const conversationIds = [
            Factory.create('conversation')._id,
            Factory.create('conversation')._id,
          ];

          assert.equal(
            Conversations.findOne(conversationIds[0]).tagIds,
            undefined
          );
          assert.equal(
            Conversations.findOne(conversationIds[1]).tagIds,
            undefined
          );

          tag._execute({ userId }, { conversationIds, tagIds });

          assert.equal(
            Conversations.findOne(conversationIds[0]).tagIds[0],
            tagIds[0]
          );
          assert.equal(
            Conversations.findOne(conversationIds[1]).tagIds[0],
            tagIds[0]
          );
        });
      });

      describe('star', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            star._execute({}, { conversationIds: [Random.id()] });
          }, Meteor.Error, /loginRequired/);
        });

        it('conversation must exist', function () {
          assert.throws(() => {
            star._execute({ userId }, { conversationIds: [Random.id()] });
          }, Meteor.Error, /conversations.star.conversationNotFound/);
        });

        it('star', function () {
          const userId2 = Factory.create('user')._id;
          Factory.create('channel', { memberIds: [userId2] });

          const conversationIds = [
            Factory.create('conversation')._id,
            Factory.create('conversation')._id,
          ];

          assert.equal(
            Meteor.users.findOne(userId2).details.starredConversationIds,
            undefined
          );

          star._execute({ userId: userId2 }, { conversationIds });

          assert.equal(
            Meteor.users.findOne(userId2).details.starredConversationIds[0],
            conversationIds[0]
          );

          assert.equal(
            Meteor.users.findOne(userId2).details.starredConversationIds[1],
            conversationIds[1]
          );
        });
      });

      describe('unstar', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            star._execute({}, { conversationIds: [Random.id()] });
          }, Meteor.Error, /loginRequired/);
        });

        it('unstar', function () {
          const conversationIds = [Random.id(), Random.id()];

          Meteor.users.update(
            userId,
            { $set: { 'details.starredConversationIds': conversationIds } }
          );

          unstar._execute({ userId }, { conversationIds });

          assert.equal(
            Meteor.users.findOne(userId).details.starredConversationIds.length,
            0
          );
        });
      });
    });
  });
}
