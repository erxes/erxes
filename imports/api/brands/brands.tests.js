/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/publication-collector';

import { Customers } from '/imports/api/customers/customers';
import { Brands } from './brands';
import { add, edit, remove } from './methods';
import '/imports/api/users/factory';

if (Meteor.isServer) {
  require('./server/publications');

  describe('brands', function () {
    describe('publications', function () {
      const userId = Factory.create('user')._id;
      const limit = 100;

      let brand;

      before(function () {
        Brands.remove({});
        _.times(2, () => Factory.create('brand', { userId }));
        _.times(2, () => Factory.create('brand', { userId: Random.id() }));
        brand = Factory.create('brand', { userId });
      });

      describe('brands.list', function () {
        it('sends all brands', function (done) {
          const collector = new PublicationCollector({ userId });
          collector.collect('brands.list', limit, (collections) => {
            assert.equal(collections.brands.length, 5);
            done();
          });
        });

        it('do not send brands without user', function (done) {
          const collector = new PublicationCollector();
          collector.collect('brands.list', limit, (collections) => {
            assert.equal(collections.brands, undefined);
            done();
          });
        });
      });

      describe('brands.getById', function () {
        it('sends brand by id', function (done) {
          const collector = new PublicationCollector({ userId });
          collector.collect('brands.getById', brand._id, (collections) => {
            assert.equal(collections.brands.length, 1);
            assert.equal(collections.brands[0]._id, brand._id);
            done();
          });
        });
      });
    });

    describe('methods', function () {
      let userId;
      let brandId;
      let customerId;

      beforeEach(function () {
        // Clear
        Brands.remove({});
        Customers.remove({});

        // Generate a 'user'
        userId = Factory.create('user')._id;

        brandId = Factory.create('brand', { name: 'foo', userId })._id;
        customerId = Factory.create('customer', { brandId })._id;
      });

      describe('add', function () {
        it('only works if you are logged in', function () {
          assert.throws(
            () => {
              add._execute({}, { doc: { name: 'Foo' } });
            },

            Meteor.Error, /loginRequired/
          );
        });

        it('add', function () {
          assert.equal(Brands.find().count(), 1);

          add._execute({ userId }, { doc: { name: 'Foo' } });

          assert.equal(Brands.find().count(), 2);
        });
      });

      describe('edit', function () {
        it('only works if you are logged in', function () {
          assert.throws(
            () => {
              edit._execute({}, { id: brandId, doc: { name: 'Bar' } });
            },

            Meteor.Error, /loginRequired/
          );
        });

        it('not found', function () {
          assert.throws(
            () => {
              edit._execute(
                { userId },
                { id: Random.id(), doc: { name: 'Bar' } }
              );
            },
            Meteor.Error,
            /brands.edit.notFound/
          );
        });

        it('edit', function () {
          edit._execute(
            { userId },
            { id: brandId, doc: { name: 'Bar' } }
          );

          assert.equal(Brands.findOne(brandId).name, 'Bar');
        });
      });

      describe('remove', function () {
        it('only works if you are logged in', function () {
          assert.throws(
            () => {
              remove._execute({}, brandId);
            },

            Meteor.Error,
            /loginRequired/
          );
        });

        it('not found', function () {
          assert.throws(
            () => {
              remove._execute({ userId }, Random.id());
            },

            Meteor.Error,
            /brands.remove.notFound/
          );
        });

        it('remove', function () {
          assert.equal(Brands.find().count(), 1);
          Customers.remove(customerId);

          remove._execute({ userId }, brandId);

          assert.equal(Brands.find().count(), 0);
        });
      });
    });
  });
}
