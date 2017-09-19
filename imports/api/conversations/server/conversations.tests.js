/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';
import { Notifications } from 'meteor/erxes-notifications';

import { Conversations } from '../conversations';
import { CONVERSATION_STATUSES } from '../constants';
import { assign, unassign, changeStatus, star, unstar, toggleParticipate } from './methods';

describe('conversations', function() {
  describe('methods', function() {
    let userId;

    beforeEach(function() {
      // Clear
      Conversations.remove({});
      Notifications.remove({});

      userId = Factory.create('user')._id;
    });

    describe('assign', function() {
      it('only works if you are logged in', function() {
        assert.throws(
          () => {
            assign._execute({}, { assignedUserId: Random.id(), conversationIds: [Random.id()] });
          },
          Meteor.Error,
          /loginRequired/,
        );
      });

      it('conversation must exist', function() {
        assert.throws(
          () => {
            assign._execute(
              { userId },
              { assignedUserId: Random.id(), conversationIds: [Random.id()] },
            );
          },
          Meteor.Error,
          /conversations.conversationNotFound/,
        );
      });

      it('user must exist', function() {
        const conversationIds = [Factory.create('conversation')._id];

        assert.throws(
          () => {
            assign._execute({ userId }, { assignedUserId: Random.id(), conversationIds });
          },
          Meteor.Error,
          /conversations.assign.userNotFound/,
        );
      });

      it('assign', function() {
        const assignedUserId = Factory.create('user')._id;
        Factory.create('channel', { memberIds: [assignedUserId, userId] });

        const conversationIds = [
          Factory.create('conversation')._id,
          Factory.create('conversation')._id,
        ];

        // notifications must not send yet
        assert.equal(Notifications.find().count(), 0);

        assign._execute({ userId }, { assignedUserId, conversationIds });

        assert.equal(Conversations.findOne(conversationIds[0]).assignedUserId, assignedUserId);

        assert.equal(Conversations.findOne(conversationIds[1]).assignedUserId, assignedUserId);

        // assigned users must received notification
        assert.equal(Notifications.find({ receiver: assignedUserId }).count(), 2);

        const notif = Notifications.findOne({ receiver: assignedUserId });

        assert.equal(notif.notifType, 'conversationAssigneeChange');
        assert.equal(notif.receiver, assignedUserId);
      });
    });

    describe('unassign', function() {
      it('only works if you are logged in', function() {
        assert.throws(
          () => {
            unassign._execute({}, { conversationIds: [Random.id()] });
          },
          Meteor.Error,
          /loginRequired/,
        );
      });

      it('conversation must exist', function() {
        assert.throws(
          () => {
            unassign._execute({ userId }, { conversationIds: [Random.id()] });
          },
          Meteor.Error,
          /conversations.conversationNotFound/,
        );
      });

      it('unassign', function() {
        Factory.create('channel', { memberIds: [userId] });
        const assignedUserId = Random.id();

        const conversationIds = [
          Factory.create('conversation', { assignedUserId })._id,
          Factory.create('conversation', { assignedUserId })._id,
        ];

        assert.equal(Conversations.findOne(conversationIds[0]).assignedUserId, assignedUserId);

        assert.equal(Conversations.findOne(conversationIds[1]).assignedUserId, assignedUserId);

        unassign._execute({ userId }, { conversationIds });

        assert.equal(Conversations.findOne(conversationIds[0]).assignedUserId, undefined);

        assert.equal(Conversations.findOne(conversationIds[1]).assignedUserId, undefined);
      });
    });

    describe('change status', function() {
      const randomData = {
        conversationIds: [Random.id()],
        status: CONVERSATION_STATUSES.CLOSED,
      };

      it('only works if you are logged in', function() {
        assert.throws(
          () => {
            changeStatus._execute({}, randomData);
          },
          Meteor.Error,
          /loginRequired/,
        );
      });

      it('conversation must exist', function() {
        assert.throws(
          () => {
            changeStatus._execute({ userId }, randomData);
          },
          Meteor.Error,
          /conversations.conversationNotFound/,
        );
      });

      it('wrong status', function() {
        const conversationId = Factory.create('conversation')._id;

        assert.throws(
          () => {
            changeStatus._execute({ userId }, { status: 'foo', conversationIds: [conversationId] });
          },
          Meteor.Error,
          /validation-error/,
        );
      });

      it('change status', function() {
        const participatedUserId = Factory.create('user')._id;
        const participatedUserIds = [participatedUserId];

        const status = CONVERSATION_STATUSES.CLOSED;
        Factory.create('channel', { memberIds: [userId] });

        const conversation = Factory.create('conversation', {
          status: CONVERSATION_STATUSES.OPEN,
          participatedUserIds,
        });

        const conversation2Id = Factory.create('conversation', {
          status: CONVERSATION_STATUSES.OPEN,
          participatedUserIds,
        })._id;

        assert.equal(conversation.status, CONVERSATION_STATUSES.OPEN);

        // notifications must not send yet
        assert.equal(Notifications.find().count(), 0);

        // execute method
        changeStatus._execute(
          { userId },
          { status, conversationIds: [conversation2Id, conversation._id] },
        );

        assert.equal(Conversations.findOne(conversation._id).status, status);

        // participated users must received notification
        const notif = Notifications.findOne({ receiver: participatedUserId });

        assert.equal(notif.notifType, 'conversationStateChange');
        assert.equal(notif.receiver, participatedUserId);
      });
    });

    describe('star', function() {
      it('only works if you are logged in', function() {
        assert.throws(
          () => {
            star._execute({}, { conversationIds: [Random.id()] });
          },
          Meteor.Error,
          /loginRequired/,
        );
      });

      it('conversation must exist', function() {
        assert.throws(
          () => {
            star._execute({ userId }, { conversationIds: [Random.id()] });
          },
          Meteor.Error,
          /conversations.conversationNotFound/,
        );
      });

      it('star', function() {
        const userId2 = Factory.create('user')._id;
        Factory.create('channel', { memberIds: [userId2] });

        const conversationIds = [
          Factory.create('conversation')._id,
          Factory.create('conversation')._id,
        ];

        assert.equal(Meteor.users.findOne(userId2).details.starredConversationIds, undefined);

        star._execute({ userId: userId2 }, { conversationIds });

        assert.equal(
          Meteor.users.findOne(userId2).details.starredConversationIds[0],
          conversationIds[0],
        );

        assert.equal(
          Meteor.users.findOne(userId2).details.starredConversationIds[1],
          conversationIds[1],
        );
      });
    });

    describe('unstar', function() {
      it('only works if you are logged in', function() {
        assert.throws(
          () => {
            star._execute({}, { conversationIds: [Random.id()] });
          },
          Meteor.Error,
          /loginRequired/,
        );
      });

      it('unstar', function() {
        const conversationIds = [Factory.create('conversation')._id];

        Meteor.users.update(userId, {
          $set: { 'details.starredConversationIds': conversationIds },
        });

        unstar._execute({ userId }, { conversationIds });

        assert.equal(Meteor.users.findOne(userId).details.starredConversationIds.length, 0);
      });
    });

    describe('toggle participate', function() {
      it('add & remove', function() {
        const prevUserId = Factory.create('user')._id;

        let conversation = Factory.create('conversation', {
          participatedUserIds: [prevUserId],
        });

        const conversationIds = [conversation._id];

        // first call =================
        toggleParticipate._execute({ userId }, { conversationIds });

        // get updated conversation
        conversation = Conversations.findOne({ _id: { $in: conversationIds } });

        // check added or not
        assert.deepEqual(conversation.participatedUserIds, [prevUserId, userId]);

        // second call ==================
        toggleParticipate._execute({ userId }, { conversationIds });

        // get updated conversation
        conversation = Conversations.findOne({ _id: { $in: conversationIds } });

        // check removed or not
        assert.deepEqual(conversation.participatedUserIds, [prevUserId]);
      });
    });
  });
});
