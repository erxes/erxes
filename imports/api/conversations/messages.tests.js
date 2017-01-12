/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Factory } from 'meteor/dburles:factory';
import { assert, chai } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/publication-collector';
import { Notifications } from 'meteor/erxes-notifications';

import { Messages } from './messages';
import { Conversations } from './conversations';
import { addMessage } from './methods';

if (Meteor.isServer) {
  require('./server/publications.js');

  describe('conversation - messages', function () {
    describe('publications', function () {
      let conversationId;
      const userId = Factory.create('user')._id;

      before(function () {
        Conversations.remove({});
        Messages.remove({});

        conversationId = Factory.create('conversation')._id;

        _.times(2, () => Factory.create('message'));
        _.times(2, () => Factory.create('message', { conversationId }));
      });

      describe('conversations.messageList', function () {
        it('sends all messages', function (done) {
          const collector = new PublicationCollector({ userId });
          collector.collect(
            'conversations.messageList',
            conversationId,
            (collections) => {
              chai.assert.equal(collections.conversation_messages.length, 2);
              done();
            }
          );
        });

        it('do not send messages without user', function (done) {
          const collector = new PublicationCollector();
          collector.collect(
            'conversations.messageList',
            conversationId,
            (collections) => {
              chai.assert.equal(collections.conversation_messages, undefined);
              done();
            }
          );
        });
      });
    });

    describe('methods', function () {
      let userId;

      beforeEach(function () {
        // Clear
        Messages.remove({});
        Notifications.remove({});

        userId = Factory.create('user')._id;
      });

      describe('addMessage', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            addMessage._execute(
              {},
              { content: 'lorem', conversationId: Random.id(), internal: false }
            );
          }, Meteor.Error, /loginRequired/);
        });

        it('conversation must exist', function () {
          assert.throws(() => {
            addMessage._execute({ userId },
              { content: 'lorem', conversationId: Random.id(), internal: false });
          }, Meteor.Error, /conversations.addMessage.conversationNotFound/);
        });

        it('add', function () {
          assert.equal(Messages.find().count(), 0);
          assert.equal(Notifications.find().count(), 0);

          const participatedUserId = Factory.create('user')._id;
          const conversationId = Factory.create('conversation', {
            participatedUserIds: [participatedUserId],
          })._id;

          addMessage._execute(
            { userId },
            { content: 'lorem', conversationId, internal: false }
          );

          assert.equal(Messages.find().count(), 1);

          // participated users must received notification
          assert.equal(Notifications.find().count(), 1);

          const notif = Notifications.findOne();

          assert.equal(notif.notifType, 'conversationAddMessage');
          assert.equal(notif.receiver, participatedUserId);
        });

        it('internal messsage', function () {
          const conversationId = Factory.create('conversation', {})._id;

          const response = addMessage._execute(
            { userId },
            { content: 'lorem', conversationId, internal: true }
          );

          assert.equal(response, 'internalMessage');
        });
      });
    });
  });
}
