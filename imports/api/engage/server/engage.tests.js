/* eslint-env mocha */

import { assert } from 'meteor/practicalmeteor:chai';
import { Factory } from 'meteor/dburles:factory';

import '/imports/api/users/factory';

import { Messages } from '../engage';
import { messagesAdd, messagesEdit, messagesRemove } from '../methods';

import './publications';

describe('engage', function() {
  describe('methods', function() {
    let userId;
    let messageId;

    beforeEach(function() {
      userId = Factory.create('user')._id;
    });

    it('add', function() {
      // method call
      const doc = {
        title: 'Test message',
        content: 'content',
        customerIds: ['DFDAFDFAFDFDFD'],
        isAuto: true,
      };

      messageId = messagesAdd._execute({ userId }, { doc });

      assert.equal(Messages.find().count(), 1);
    });

    it('edit', function() {
      const doc = {
        title: 'Updated title',
        content: 'content',
        customerIds: ['DFDAFDFAFDFDFD'],
        isAuto: true,
      };

      messagesEdit._execute({ userId }, { id: messageId, doc });

      assert.equal(Messages.findOne(messageId).title, 'Updated title');
    });

    it('remove', function() {
      assert.equal(Messages.find().count(), 1);

      messagesRemove._execute({ userId }, messageId);

      assert.equal(Messages.find().count(), 0);
    });
  });
});
