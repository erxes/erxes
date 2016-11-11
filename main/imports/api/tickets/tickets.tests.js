/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import { Factory } from 'meteor/dburles:factory';
import { assert, chai } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/publication-collector';
import { Notifications } from 'meteor/erxes-notifications';

import { Customers } from '/imports/api/customers/customers';
import { Channels } from '/imports/api/channels/channels';
import { Brands } from '/imports/api/brands/brands';
import { Integrations } from '/imports/api/integrations/integrations';

import { Tickets } from './tickets';
import { Comments } from './comments';
import { TICKET_STATUSES } from './constants';
import { assign, unassign, changeStatus, star, unstar } from './methods';

if (Meteor.isServer) {
  const { tag } = require('./server/methods');
  const {
    getOpenTicket,
    getOrAddTicket,
    addComment,
  } = require('/server/api');

  require('./server/publications');

  describe('tickets', function () {
    describe('publications', function () {
      let userId;
      let tagId;

      const createTickets = (channelName, count, ticketOptions = {}) => {
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

        _.extend(ticketOptions, { brandId });

        return _.times(count, () => Factory.create('ticket', ticketOptions)._id);
      };

      const checkCollectionLength = (done, options, length) => {
        const collector = new PublicationCollector({ userId });

        collector.collect('tickets.list', options, (collections) => {
          chai.assert.notEqual(collections.tickets, undefined);
          chai.assert.equal(collections.tickets.length, length);
          done();
        });
      };

      before(function () {
        Tickets.remove({});
        Brands.remove({});
        Integrations.remove({});
        Channels.remove({});

        // create login user
        userId = Factory.create('user')._id;

        // assigned && participated 2
        createTickets(
          'sales',
          2,
          { participatedUserIds: [userId], assignedUserId: userId }
        );

        // assigned && starred 3
        const starredTicketIds = createTickets(
          'support',
          3,
          { assignedUserId: userId, starred: TICKET_STATUSES.OPEN }
        );

        Meteor.users.update(
          userId,
          { $set: { 'details.starredTicketIds': starredTicketIds } }
        );

        // unassigned && tagged 4
        tagId = Factory.create('tag', { type: Tickets.TAG_TYPE })._id;

        createTickets('management', 4, { tagIds: [tagId] });

        // closed 3
        createTickets(
          'specialSales',
          3,
          { assignedUserId: userId, status: 'closed' }
        );
      });

      describe('tickets.list', function () {
        it('sends all open/new tickets', function (done) {
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

        it('get unassigned tickets', function (done) {
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

        it('do not send tickets without user', function (done) {
          const collector = new PublicationCollector();
          collector.collect('tickets.list', {}, (collections) => {
            chai.assert.equal(collections.tickets, undefined);
            done();
          });
        });
      });

      describe('tickets.detail', function () {
        it('sends ticket detail by id', function (done) {
          const ticketId = Tickets.findOne()._id;

          const collector = new PublicationCollector({ userId });
          collector.collect('tickets.detail', ticketId, (collections) => {
            chai.assert.equal(collections.tickets.length, 1);
            done();
          });
        });

        it('do not send ticket without user', function (done) {
          const ticketId = Tickets.findOne()._id;

          const collector = new PublicationCollector();
          collector.collect('tickets.detail', ticketId, (collections) => {
            chai.assert.equal(collections.tickets, undefined);
            done();
          });
        });
      });
    });

    describe('api', function () {
      let customerId;
      let brandId;
      let ticketId;

      before(function () {
        Customers.remove({});
        Tickets.remove({});
        Comments.remove({});

        customerId = Factory.create('customer')._id;
        brandId = Factory.create('brand')._id;
        ticketId = Factory.create('ticket', { customerId, brandId })._id;
      });

      it('getOrAddTicket - verify customer', function () {
        assert.throws(() => {
          getOrAddTicket({
            content: 'lorem',
            customerId: Random.id(),
            brandId,
          });
        }, Meteor.Error, /tickets.getOrAddTicket.customerNotFound/);
      });

      it('getOrAddTicket - add', function () {
        getOrAddTicket({
          content: 'lorem',
          customerId,
          brandId,
        });

        assert.equal(Tickets.find().count(), 1);
      });

      it('getOrAddTicket - get', function () {
        assert.equal(
          ticketId,

          getOrAddTicket({
            content: 'lorem',
            customerId,
            brandId,
          })
        );

        assert.equal(Tickets.find().count(), 1);
      });

      it('getOpenTicket', function () {
        assert.equal(
          ticketId,

          getOpenTicket({
            customerId,
            brandId,
          })._id);
      });

      it('addComment - verify ticket', function () {
        assert.throws(() => {
          addComment({ content: 'lorem', ticketId: Random.id(), customerId });
        }, Meteor.Error, /tickets.addComment.ticketNotFound/);
      });

      it('addComment - verify customer', function () {
        assert.throws(() => {
          addComment({ content: 'lorem', customerId: Random.id(), ticketId });
        }, Meteor.Error, /tickets.addComment.customerNotFound/);
      });

      it('addComment - add', function () {
        addComment({ content: 'lorem', customerId, ticketId });
        assert.equal(Comments.find().count(), 1);
      });
    });

    describe('methods', function () {
      let userId;

      beforeEach(function () {
        // Clear
        Tickets.remove({});
        Notifications.remove({});

        userId = Factory.create('user')._id;
      });

      describe('assign', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            assign._execute(
              {},
              { assignedUserId: Random.id(), ticketIds: [Random.id()] }
            );
          }, Meteor.Error, /loginRequired/);
        });

        it('ticket must exist', function () {
          assert.throws(() => {
            assign._execute(
              { userId },
              { assignedUserId: Random.id(), ticketIds: [Random.id()] }
            );
          }, Meteor.Error, /tickets.assign.ticketNotFound/);
        });

        it('user must exist', function () {
          const ticketIds = [Factory.create('ticket')._id];

          assert.throws(() => {
            assign._execute({ userId }, { assignedUserId: Random.id(), ticketIds });
          }, Meteor.Error, /tickets.assign.userNotFound/);
        });

        it('assign', function () {
          const assignedUserId = Factory.create('user')._id;
          Factory.create('channel', { memberIds: [assignedUserId, userId] });

          const ticketIds = [
            Factory.create('ticket')._id,
            Factory.create('ticket')._id,
          ];

          // notifications must not send yet
          assert.equal(Notifications.find().count(), 0);

          assign._execute({ userId }, { assignedUserId, ticketIds });

          assert.equal(
            Tickets.findOne(ticketIds[0]).assignedUserId,
            assignedUserId
          );

          assert.equal(
            Tickets.findOne(ticketIds[1]).assignedUserId,
            assignedUserId

          );

          // assigned users must received notification
          assert.equal(
            Notifications.find({ receiver: assignedUserId }).count(), 2
          );

          const notif = Notifications.findOne({ receiver: assignedUserId });

          assert.equal(notif.notifType, 'ticketAssigneeChange');
          assert.equal(notif.receiver, assignedUserId);
        });
      });

      describe('unassign', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            unassign._execute({}, { ticketIds: [Random.id()] });
          }, Meteor.Error, /loginRequired/);
        });

        it('ticket must exist', function () {
          assert.throws(() => {
            unassign._execute({ userId }, { ticketIds: [Random.id()] });
          }, Meteor.Error, /tickets.unassign.ticketNotFound/);
        });

        it('unassign', function () {
          Factory.create('channel', { memberIds: [userId] });
          const assignedUserId = Random.id();

          const ticketIds = [
            Factory.create('ticket', { assignedUserId })._id,
            Factory.create('ticket', { assignedUserId })._id,
          ];

          assert.equal(
            Tickets.findOne(ticketIds[0]).assignedUserId,
            assignedUserId
          );

          assert.equal(
            Tickets.findOne(ticketIds[1]).assignedUserId,
            assignedUserId
          );

          unassign._execute({ userId }, { ticketIds });

          assert.equal(Tickets.findOne(ticketIds[0]).assignedUserId, undefined);
          assert.equal(Tickets.findOne(ticketIds[1]).assignedUserId, undefined);
        });
      });

      describe('change status', function () {
        const randomData = {
          ticketIds: [Random.id()],
          status: TICKET_STATUSES.CLOSED,
        };

        it('only works if you are logged in', function () {
          assert.throws(() => {
            changeStatus._execute({}, randomData);
          }, Meteor.Error, /loginRequired/);
        });

        it('ticket must exist', function () {
          assert.throws(() => {
            changeStatus._execute({ userId }, randomData);
          }, Meteor.Error, /tickets.changeStatus.ticketNotFound/);
        });

        it('wrong status', function () {
          const ticketId = Factory.create('ticket')._id;

          assert.throws(() => {
            changeStatus._execute(
              { userId },
              { status: 'foo', ticketIds: [ticketId] }
            );
          }, Meteor.Error, /validation-error/);
        });

        it('change status', function () {
          const participatedUserId = Factory.create('user')._id;
          const participatedUserIds = [participatedUserId];

          const status = TICKET_STATUSES.CLOSED;
          Factory.create('channel', { memberIds: [userId] });

          const ticket = Factory.create('ticket',
            { status: TICKET_STATUSES.OPEN, participatedUserIds });

          const ticket2Id = Factory.create('ticket',
            { status: TICKET_STATUSES.OPEN, participatedUserIds })._id;

          assert.equal(ticket.status, TICKET_STATUSES.OPEN);

          // notifications must not send yet
          assert.equal(Notifications.find().count(), 0);

          // execute method
          changeStatus._execute(
            { userId },
            { status, ticketIds: [ticket2Id, ticket._id] }
          );

          assert.equal(Tickets.findOne(ticket._id).status, status);

          // participated users must received notification
          const notif = Notifications.findOne({ receiver: participatedUserId });

          assert.equal(notif.notifType, 'ticketStateChange');
          assert.equal(notif.receiver, participatedUserId);
        });
      });

      describe('tag', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            tag._execute({}, { ticketIds: [Random.id()], tagIds: [Random.id()] });
          }, Meteor.Error, /loginRequired/);
        });

        it('ticket must exist', function () {
          assert.throws(() => {
            tag._execute(
              { userId },
              { ticketIds: [Random.id()], tagIds: [Random.id()] }
            );
          }, Meteor.Error, /tickets.tag.ticketNotFound/);
        });

        it('tag', function () {
          Factory.create('channel', { memberIds: [userId] });
          const tagIds = [Factory.create('tag', { type: Tickets.TAG_TYPE })._id];

          const ticketIds = [
            Factory.create('ticket')._id,
            Factory.create('ticket')._id,
          ];

          assert.equal(Tickets.findOne(ticketIds[0]).tagIds, undefined);
          assert.equal(Tickets.findOne(ticketIds[1]).tagIds, undefined);

          tag._execute({ userId }, { ticketIds, tagIds });

          assert.equal(Tickets.findOne(ticketIds[0]).tagIds[0], tagIds[0]);
          assert.equal(Tickets.findOne(ticketIds[1]).tagIds[0], tagIds[0]);
        });
      });

      describe('star', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            star._execute({}, { ticketIds: [Random.id()] });
          }, Meteor.Error, /loginRequired/);
        });

        it('ticket must exist', function () {
          assert.throws(() => {
            star._execute({ userId }, { ticketIds: [Random.id()] });
          }, Meteor.Error, /tickets.star.ticketNotFound/);
        });

        it('star', function () {
          const userId2 = Factory.create('user')._id;
          Factory.create('channel', { memberIds: [userId2] });

          const ticketIds = [
            Factory.create('ticket')._id,
            Factory.create('ticket')._id,
          ];

          assert.equal(
            Meteor.users.findOne(userId2).details.starredTicketIds,
            undefined
          );

          star._execute({ userId: userId2 }, { ticketIds });

          assert.equal(
            Meteor.users.findOne(userId2).details.starredTicketIds[0],
            ticketIds[0]
          );

          assert.equal(
            Meteor.users.findOne(userId2).details.starredTicketIds[1],
            ticketIds[1]
          );
        });
      });

      describe('unstar', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            star._execute({}, { ticketIds: [Random.id()] });
          }, Meteor.Error, /loginRequired/);
        });

        it('unstar', function () {
          const ticketIds = [Random.id(), Random.id()];

          Meteor.users.update(
            userId,
            { $set: { 'details.starredTicketIds': ticketIds } }
          );

          unstar._execute({ userId }, { ticketIds });

          assert.equal(
            Meteor.users.findOne(userId).details.starredTicketIds.length,
            0
          );
        });
      });
    });
  });
}
