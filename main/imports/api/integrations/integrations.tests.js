/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';

import { Integrations } from './integrations';
import { add, edit, remove } from './methods';

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

      describe('add', function () {
        it('add', function () {
          add._execute(
            { userId },
            { doc: { kind: 'chat', name: 'Foo', brandId } }
          );

          assert.equal(Integrations.find().count(), 1);
        });
      });

      describe('edit', function () {
        it('edit', function () {
          const integration = Integrations.findOne({ name: 'Foo' });
          integrationId = integration._id;

          edit._execute(
            { userId },
            {
              id: integrationId,
              doc: {
                kind: 'chat',
                name: 'UpdatedBar',
                brandId: integration.brandId,
              },
            }
          );

          assert.equal(
            Integrations.findOne({ _id: integrationId }).name,
            'UpdatedBar'
          );
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
