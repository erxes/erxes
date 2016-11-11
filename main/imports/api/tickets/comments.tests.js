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
import { Tickets } from './tickets';
import { addComment } from './methods';

if (Meteor.isServer) {
  require('./server/publications.js');

  describe('ticket - comments', function () {
    describe('publications', function () {
      let ticketId;
      const userId = Factory.create('user')._id;

      before(function () {
        Tickets.remove({});
        Comments.remove({});

        ticketId = Factory.create('ticket')._id;

        _.times(2, () => Factory.create('comment'));
        _.times(2, () => Factory.create('comment', { ticketId }));
      });

      describe('tickets.commentList', function () {
        it('sends all comments', function (done) {
          const collector = new PublicationCollector({ userId });
          collector.collect('tickets.commentList', ticketId, (collections) => {
            chai.assert.equal(collections.ticket_comments.length, 2);
            done();
          });
        });

        it('do not send comments without user', function (done) {
          const collector = new PublicationCollector();
          collector.collect('tickets.commentList', ticketId, (collections) => {
            chai.assert.equal(collections.ticket_comments, undefined);
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
              { content: 'lorem', ticketId: Random.id(), internal: false }
            );
          }, Meteor.Error, /loginRequired/);
        });

        it('ticket must exist', function () {
          assert.throws(() => {
            addComment._execute({ userId },
              { content: 'lorem', ticketId: Random.id(), internal: false });
          }, Meteor.Error, /tickets.addComment.ticketNotFound/);
        });

        it('add', function () {
          assert.equal(Comments.find().count(), 0);
          assert.equal(Notifications.find().count(), 0);

          const participatedUserId = Factory.create('user')._id;
          const ticketId = Factory.create('ticket', {
            participatedUserIds: [participatedUserId],
          })._id;

          addComment._execute(
            { userId },
            { content: 'lorem', ticketId, internal: false }
          );

          assert.equal(Comments.find().count(), 1);

          // participated users must received notification
          assert.equal(Notifications.find().count(), 1);

          const notif = Notifications.findOne();

          assert.equal(notif.notifType, 'ticketAddComment');
          assert.equal(notif.receiver, participatedUserId);
        });
      });
    });
  });
}
