/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Factory } from 'meteor/dburles:factory';
import { assert, chai } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/publication-collector';
import { Notifications } from 'meteor/erxes-notifications';

import { Comments } from './comments';
import { Conversations } from './conversations';
import { addComment } from './methods';

if (Meteor.isServer) {
  require('./server/publications.js');

  describe('conversation - comments', function () {
    describe('publications', function () {
      let conversationId;
      const userId = Factory.create('user')._id;

      before(function () {
        Conversations.remove({});
        Comments.remove({});

        conversationId = Factory.create('conversation')._id;

        _.times(2, () => Factory.create('comment'));
        _.times(2, () => Factory.create('comment', { conversationId }));
      });

      describe('conversations.commentList', function () {
        it('sends all comments', function (done) {
          const collector = new PublicationCollector({ userId });
          collector.collect('conversations.commentList', conversationId, (collections) => {
            chai.assert.equal(collections.conversation_comments.length, 2);
            done();
          });
        });

        it('do not send comments without user', function (done) {
          const collector = new PublicationCollector();
          collector.collect('conversations.commentList', conversationId, (collections) => {
            chai.assert.equal(collections.conversation_comments, undefined);
            done();
          });
        });
      });
    });

    describe('methods', function () {
      let userId;

      beforeEach(function () {
        // Clear
        Comments.remove({});
        Notifications.remove({});

        userId = Factory.create('user')._id;
      });

      describe('addComment', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            addComment._execute(
              {},
              { content: 'lorem', conversationId: Random.id(), internal: false }
            );
          }, Meteor.Error, /loginRequired/);
        });

        it('conversation must exist', function () {
          assert.throws(() => {
            addComment._execute({ userId },
              { content: 'lorem', conversationId: Random.id(), internal: false });
          }, Meteor.Error, /conversations.addComment.conversationNotFound/);
        });

        it('add', function () {
          assert.equal(Comments.find().count(), 0);
          assert.equal(Notifications.find().count(), 0);

          const participatedUserId = Factory.create('user')._id;
          const conversationId = Factory.create('conversation', {
            participatedUserIds: [participatedUserId],
          })._id;

          addComment._execute(
            { userId },
            { content: 'lorem', conversationId, internal: false }
          );

          assert.equal(Comments.find().count(), 1);

          // participated users must received notification
          assert.equal(Notifications.find().count(), 1);

          const notif = Notifications.findOne();

          assert.equal(notif.notifType, 'conversationAddComment');
          assert.equal(notif.receiver, participatedUserId);
        });
      });
    });
  });
}
