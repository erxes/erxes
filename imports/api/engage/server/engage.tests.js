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

    const emailContent = {
      from: 'from@yahoo.com',
      subject: 'subject',
      content: 'content',
    };

    beforeEach(function() {
      userId = Factory.create('user')._id;
    });

    it('add', function() {
      // method call
      const doc = {
        segmentId: 'FDDFEFEFDAFDSFE',
        title: 'Test message',
        email: emailContent,
        customerIds: ['DFDAFDFAFDFDFD'],
        isAuto: true,
      };

      messageId = messagesAdd._execute({ userId }, { doc });

      assert.equal(Messages.find().count(), 1);
    });

    it('edit', function() {
      const doc = {
        segmentId: 'FDDFEFEFDAFDSFE',
        title: 'Updated title',
        email: emailContent,
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
