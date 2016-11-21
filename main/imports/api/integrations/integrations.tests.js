/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';

import { Integrations } from './integrations';
import { KIND_CHOICES } from './constants';
import { addInAppMessaging, remove } from './server/methods';

if (Meteor.isServer) {
  describe('integrations', function () {
    describe('methods', function () {
      let integrationId;
      let userId;
      let brandId;

      before(function () {
        Integrations.remove({});

        userId = Factory.create('user')._id;
        brandId = Factory.create('brand', { userId })._id;
      });

      describe('add in app messsaging', function () {
        it('add in app messsaging', function () {
          addInAppMessaging._execute(
            { userId },
            { doc: { name: 'Foo', brandId } }
          );

          assert.equal(
            Integrations.find({ kind: KIND_CHOICES.IN_APP_MESSAGING }).count(),
            1
          );

          const integration = Integrations.findOne({ name: 'Foo' });
          integrationId = integration._id;
        });
      });

      describe('remove', function () {
        it('remove', function () {
          assert.equal(Integrations.find().count(), 1);
          remove._execute({ userId }, integrationId);
          assert.equal(Integrations.find().count(), 0);
        });
      });
    });
  });
}
