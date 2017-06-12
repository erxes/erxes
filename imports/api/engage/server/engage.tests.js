/* eslint-env mocha */

import { assert } from 'meteor/practicalmeteor:chai';
import { Factory } from 'meteor/dburles:factory';

import Segments from '/imports/api/customers/segments';
import '/imports/api/users/factory';

import { Messages } from '../engage';
import { replaceKeys, send } from '../utils';
import { messagesAdd, messagesEdit, messagesRemove } from './methods';
import './publications';

describe('engage', function() {
  describe('methods', function() {
    let userId;
    let messageId;

    const emailContent = {
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
        fromUserId: 'FDDFEFEFDAFDSFE',
        title: 'Test message',
        email: emailContent,
        isAuto: true,
      };

      messageId = messagesAdd._execute({ userId }, { doc });

      assert.equal(Messages.find().count(), 1);
    });

    it('edit', function() {
      const doc = {
        segmentId: 'FDDFEFEFDAFDSFE',
        fromUserId: 'FDDFEFEFDAFDSFE',
        title: 'Updated title',
        email: emailContent,
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

  describe('utils', function() {
    it('replaceKeys', function() {
      const name = 'name';
      const email = 'email@gmail.com';

      // replace customer fields
      let response = replaceKeys({
        content: `{{customer.name}}{{customer.name}}{{customer.email}}`,
        customer: Factory.create('customer', { name, email }),
        user: {},
      });

      assert.equal(response, `${name}${name}${email}`);

      // replace user fields
      const fullName = 'full name';
      const position = 'position';

      response = replaceKeys({
        content: `{{user.fullName}}{{user.position}}{{user.email}}`,
        customer: {},
        user: Factory.create('user', { fullName, position, email }),
      });

      assert.equal(response, `${fullName}${position}${email}`);
    });

    it('send', function() {
      const fromUserId = Factory.create('user')._id;
      const subject = '{{ customer.name }}';
      const content = '{{ user.email }} {{ customer.email }}';

      // create customer from segment
      Factory.create('customer', { name: 'name' });

      const segmentId = Segments.insert({
        name: 'test segment',
        color: '#fff',
        connector: 'all',
        conditions: [
          {
            field: 'name',
            operator: 'c',
            value: 'n',
            dateUnit: 'days',
            type: 'string',
          },
        ],
      });

      send({ fromUserId, segmentId, email: { subject, content } });
    });
  });
});
