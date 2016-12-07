/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';

import { Integrations } from './integrations';
import { KIND_CHOICES } from './constants';
import { addInAppMessaging, remove } from './server/methods';
import { addFacebook } from './server/methods';

if (Meteor.isServer) {
  describe('integrations', function () {
    describe('methods', function () {
      let userId;
      let brandId;

      beforeEach(function () {
        Integrations.remove({});

        userId = Factory.create('user')._id;
        brandId = Factory.create('brand', { userId })._id;
      });

      it('add in app messsaging', function () {
        addInAppMessaging._execute(
          { userId },
          { doc: { name: 'Foo', brandId } }
        );

        const integration = Integrations.findOne({ name: 'Foo' });

        // check field values
        assert.equal(integration.kind, KIND_CHOICES.IN_APP_MESSAGING);
        assert.equal(integration.brandId, brandId);
      });

      it('add facebook', function () {
        const appId = '24242424242';
        const pageIds = ['9934324242424242', '42424242424'];

        addFacebook._execute(
          { userId },
          {
            name: 'Foo',
            brandId,
            appId,
            pageIds,
          }
        );

        const integration = Integrations.findOne({ name: 'Foo' });

        // check field values
        assert.equal(integration.kind, KIND_CHOICES.FACEBOOK);
        assert.equal(integration.brandId, brandId);
        assert.equal(integration.facebookData.appId, appId);
        assert.deepEqual(integration.facebookData.pageIds, pageIds);
      });

      describe('remove', function () {
        it('can not remove integration used in channel', function () {
          // create integration
          const integrationId = Factory.create('integration')._id;

          // create channel using integration
          Factory.create('channel', { integrationIds: [integrationId] });

          // check exception
          assert.throws(
            () => {
              remove._execute({ userId }, integrationId);
            },

            Meteor.Error,
            /integrations.remove.usedInChannel/
          );
        });

        it('remove', function () {
          const integrationId = Factory.create('integration')._id; // create

          assert.equal(Integrations.find().count(), 1); // check created

          remove._execute({ userId }, integrationId); // try to delete

          assert.equal(Integrations.find().count(), 0); // check deleted
        });
      });
    });
  });
}
