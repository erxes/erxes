/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import { Factory } from 'meteor/dburles:factory';
import { assert, chai } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { Notifications } from 'meteor/erxes-notifications';

import { Channels } from '/imports/api/channels/channels';
import { add, edit, remove } from './methods';

if (Meteor.isServer) {
  require('./server/publications.js');

  describe('channels', function () {
    describe('mutators', function () {
      it('builds correctly from factory', function () {
        const brand = Factory.create('brand');
        assert.typeOf(brand, 'object');
        assert.typeOf(brand.createdAt, 'date');
        assert.typeOf(brand.code, 'string');
      });
    });

    describe('publications', function () {
      const userId = Factory.create('user')._id;
      let channel;

      before(function () {
        Channels.remove({});
        _.times(2, () => Factory.create('channel'));
        _.times(2, () => Factory.create('channel', { memberIds: [userId] }));

        _.times(2, () => Factory.create('channel', { userId }));
        channel = Factory.create('channel', { userId });
      });

      describe('channels.list', function () {
        it('sends all channels', function (done) {
          const collector = new PublicationCollector({ userId });
          collector.collect('channels.list', {}, (collections) => {
            chai.assert.equal(collections.channels.length, 7);
            done();
          });
        });
      });

      describe('channels.list', function () {
        it('do not send channels without user', function (done) {
          const collector = new PublicationCollector();
          collector.collect('channels.list', {}, (collections) => {
            chai.assert.equal(collections.channels, undefined);
            done();
          });
        });
      });

      describe('channels.getById', function () {
        it('sends channel by id', function (done) {
          const collector = new PublicationCollector({ userId });
          collector.collect('channels.getById', channel._id, (collections) => {
            chai.assert.equal(collections.channels.length, 1);
            chai.assert.equal(collections.channels[0]._id, channel._id);
            done();
          });
        });
      });
    });

    describe('methods', function () {
      let userId;
      let channelId;

      beforeEach(function () {
        // Clear
        Channels.remove({});
        Notifications.remove({});
        Meteor.users.remove({});

        // Generate a 'user'
        userId = Factory.create('user')._id;

        channelId = Factory.create(
          'channel',
          {
            name: 'foo',
            userId,
            memberIds: [Factory.create('user')._id],
          }
        )._id;
      });

      describe('add', function () {
        it('only works if you are logged in', function () {
          assert.throws(
            () => {
              add._execute(
                {},
                {
                  doc: {
                    name: 'Foo',
                    memberIds: [],
                    integrationIds: [],
                  },
                }
              );
            },

            Meteor.Error,
            /loginRequired/
          );
        });

        it('add', function () {
          const newMemberId = Factory.create('user')._id;

          assert.equal(Channels.find().count(), 1);

          // notifications must not send yet
          assert.equal(Notifications.find().count(), 0);

          // execute method
          add._execute(
            { userId },
            {
              doc: {
                name: 'Foo',
                memberIds: [newMemberId],
                integrationIds: [],
              },
            }
          );

          assert.equal(Channels.find().count(), 2);

          // new members must received notification
          assert.equal(
            Notifications.find({ receiver: newMemberId }).count(), 1
          );

          const notif = Notifications.findOne({ receiver: newMemberId });

          assert.equal(notif.notifType, 'channelMembersChange');
          assert.equal(notif.receiver, newMemberId);
        });
      });

      describe('edit', function () {
        it('only works if you are logged in', function () {
          assert.throws(
            () => {
              edit._execute(
                {},
                {
                  id: channelId,
                  doc: {
                    name: 'Bar',
                    memberIds: [],
                    integrationIds: [],
                  },
                }
              );
            },

            Meteor.Error,
            /loginRequired/
          );
        });

        it('not found', function () {
          assert.throws(
            () => {
              edit._execute(
                { userId },
                {
                  id: Random.id(),
                  doc: {
                    name: 'Bar',
                    memberIds: [],
                    integrationIds: [],
                  },
                }
              );
            },

            Meteor.Error,
            /channels.edit.notFound/
          );
        });

        it('edit', function () {
          edit._execute(
            { userId },

            {
              id: channelId,
              doc: {
                name: 'Bar',
                memberIds: [],
                integrationIds: [],
              },
            }
          );

          assert.equal(Channels.findOne(channelId).name, 'Bar');
        });
      });

      describe('remove', function () {
        it('only works if you are logged in', function () {
          assert.throws(() => {
            remove._execute({}, channelId);
          }, Meteor.Error, /loginRequired/);
        });

        it('not found', function () {
          assert.throws(() => {
            remove._execute({ userId }, Random.id());
          }, Meteor.Error, /channels.remove.notFound/);
        });

        it('remove', function () {
          assert.equal(Channels.find().count(), 1);

          remove._execute({ userId }, channelId);

          assert.equal(Channels.find().count(), 0);
        });
      });
    });
  });
}
