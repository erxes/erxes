/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';
import { Notifications } from 'meteor/erxes-notifications';

import { Messages } from '../messages';
import { addMessage } from './methods';

describe('conversation - messages', function() {
  describe('methods', function() {
    let userId;

    beforeEach(function() {
      // Clear
      Messages.remove({});
      Notifications.remove({});

      userId = Factory.create('user')._id;
    });

    describe('addMessage', function() {
      it('only works if you are logged in', function() {
        assert.throws(
          () => {
            addMessage._execute(
              {},
              {
                content: 'lorem',
                conversationId: Random.id(),
                internal: false,
              },
            );
          },
          Meteor.Error,
          /loginRequired/,
        );
      });

      it('conversation must exist', function() {
        assert.throws(
          () => {
            addMessage._execute(
              { userId },
              {
                content: 'lorem',
                conversationId: Random.id(),
                internal: false,
              },
            );
          },
          Meteor.Error,
          /conversations.addMessage.conversationNotFound/,
        );
      });

      it('add', function() {
        assert.equal(Messages.find().count(), 0);
        assert.equal(Notifications.find().count(), 0);

        const participatedUserId = Factory.create('user')._id;
        const conversationId = Factory.create('conversation', {
          participatedUserIds: [participatedUserId],
        })._id;

        addMessage._execute({ userId }, { content: 'lorem', conversationId, internal: false });

        assert.equal(Messages.find().count(), 1);

        // participated users must received notification
        assert.equal(Notifications.find().count(), 1);

        const notif = Notifications.findOne();

        assert.equal(notif.notifType, 'conversationAddMessage');
        assert.equal(notif.receiver, participatedUserId);
      });

      it('internal messsage', function() {
        const conversationId = Factory.create('conversation', {})._id;

        const response = addMessage._execute(
          { userId },
          { content: 'lorem', conversationId, internal: true },
        );

        assert.equal(response, 'internalMessage');
      });
    });
  });
});
