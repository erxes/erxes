/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { Factory } from 'meteor/dburles:factory';
import { Channels } from '/imports/api/channels/channels';
import { Conversations } from '/imports/api/conversations/conversations';
import { ROLES } from '../constants';
import { invite, updateInvitationInfos, remove } from './methods';

if (Meteor.isServer) {
  describe('users', function() {
    describe('methods', function() {
      describe('invite', function() {
        let userId;
        let channel;

        beforeEach(function() {
          // remove old datas
          Meteor.users.remove({});
          Channels.remove({});

          // Generate a 'user'
          userId = Factory.create('user')._id;

          // create channel
          channel = Factory.create('channel', { memberIds: [] });
        });

        it('invite', function() {
          const doc = {
            email: 'invited@gmail.com',
            username: 'invited',
            twitterUsername: 'twitterUsername',
            fullName: 'FirstName LastName',
            password: 'pass',
            passwordConfirmation: 'pass',
            role: ROLES.ADMIN,
            channelIds: [channel._id],
          };

          // must be logged in 1 users
          assert.equal(Meteor.users.find().count(), 1);

          // channel must have 1 member
          assert.equal(channel.memberIds.length, 1);

          // ===== invite user
          invite._execute({ userId }, doc);

          // must be created 1 user
          assert.equal(Meteor.users.find().count(), 2);

          // now channel must have 2 members
          const updatedChannel = Channels.findOne(channel._id);
          assert.equal(updatedChannel.memberIds.length, 2);
        });
      });

      describe('updateInvitationInfos', function() {
        let userId;
        let invitedUserId;
        let channel1Id;
        let channel2Id;
        let channel3Id;

        beforeEach(function() {
          // remove old datas
          Meteor.users.remove({});
          Channels.remove({});

          // Generate a 'user'
          userId = Factory.create('user')._id;
          invitedUserId = Factory.create('user')._id;

          // create channels
          channel1Id = Factory.create('channel', { memberIds: [invitedUserId] })._id;
          channel2Id = Factory.create('channel', { memberIds: [invitedUserId] })._id;
          channel3Id = Factory.create('channel')._id;
        });

        it('updateInvitationInfos', function() {
          // ===== update channels, role
          updateInvitationInfos._execute(
            { userId },
            {
              userId: invitedUserId,
              email: 'invited@gmail.com',
              username: 'invited',
              twitterUsername: 'twitterUsername',
              fullName: 'FirstName LastName',
              role: 'admin',
              channelIds: [channel1Id, channel3Id],
            },
          );

          const channel1 = Channels.findOne(channel1Id);
          const channel2 = Channels.findOne(channel2Id);
          const channel3 = Channels.findOne(channel3Id);

          // invited user must be in channel1
          assert.isTrue(channel1.memberIds.includes(invitedUserId));

          // invited user must not be in channel2
          assert.isFalse(channel2.memberIds.includes(invitedUserId));

          // invited user must be in channel3
          assert.isTrue(channel3.memberIds.includes(invitedUserId));
        });
      });

      describe('remove', function() {
        let userId;
        let removeToUserId;

        beforeEach(function() {
          Meteor.users.remove({});

          // Generate a 'user'
          userId = Factory.create('user')._id;
          removeToUserId = Factory.create('user')._id;
        });

        it('involved in channel:created', function() {
          Factory.create('channel', { userId: removeToUserId });

          // must be 2 user
          assert.equal(Meteor.users.find().count(), 2);

          assert.throws(
            () => {
              remove._execute({ userId }, { userId: removeToUserId });
            },
            Meteor.Error,
            /users.remove.involvedInChannel/,
          );

          // must not be deleted
          assert.equal(Meteor.users.find().count(), 2);

          Channels.remove({});
        });

        it('involved in channel:in members', function() {
          Factory.create('channel', { memberIds: [removeToUserId] });

          assert.throws(
            () => {
              remove._execute({ userId }, { userId: removeToUserId });
            },
            Meteor.Error,
            /users.remove.involvedInChannel/,
          );

          Channels.remove({});
        });

        it('can not delete owner', function() {
          const owner = Factory.create('user', { isOwner: 1 });

          assert.throws(
            () => {
              remove._execute({ userId }, { userId: owner._id });
            },
            Meteor.Error,
            /users.remove.canNotDeleteOwner/,
          );

          Conversations.remove({});
        });

        it('remove successfully', function() {
          // must be 2 user
          assert.equal(Meteor.users.find().count(), 2);

          // method call
          remove._execute({ userId }, { userId: removeToUserId });

          // must be deleted
          assert.equal(Meteor.users.find().count(), 1);

          Conversations.remove({});
        });
      });
    });
  });
}
