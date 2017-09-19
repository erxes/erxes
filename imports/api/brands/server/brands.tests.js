/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';
import '/imports/api/users/factory';
import { Customers } from '/imports/api/customers/customers';
import { Brands } from '../brands';
import { add, edit, remove } from './methods';

describe('brands', function() {
  describe('methods', function() {
    let userId;
    let brandId;
    let customerId;

    beforeEach(function() {
      // Clear
      Brands.remove({});
      Customers.remove({});

      // Generate a 'user'
      userId = Factory.create('user')._id;

      brandId = Factory.create('brand', { name: 'foo', userId })._id;
      customerId = Factory.create('customer', { brandId })._id;
    });

    describe('add', function() {
      it('only works if you are logged in', function() {
        assert.throws(
          () => {
            add._execute({}, { doc: { name: 'Foo' } });
          },
          Meteor.Error,
          /loginRequired/,
        );
      });

      it('add', function() {
        assert.equal(Brands.find().count(), 1);

        add._execute({ userId }, { doc: { name: 'Foo' } });

        assert.equal(Brands.find().count(), 2);
      });
    });

    describe('edit', function() {
      it('only works if you are logged in', function() {
        assert.throws(
          () => {
            edit._execute({}, { id: brandId, doc: { name: 'Bar' } });
          },
          Meteor.Error,
          /loginRequired/,
        );
      });

      it('not found', function() {
        assert.throws(
          () => {
            edit._execute({ userId }, { id: Random.id(), doc: { name: 'Bar' } });
          },
          Meteor.Error,
          /brands.edit.notFound/,
        );
      });

      it('edit', function() {
        edit._execute({ userId }, { id: brandId, doc: { name: 'Bar' } });

        assert.equal(Brands.findOne(brandId).name, 'Bar');
      });
    });

    describe('remove', function() {
      it('only works if you are logged in', function() {
        assert.throws(
          () => {
            remove._execute({}, brandId);
          },
          Meteor.Error,
          /loginRequired/,
        );
      });

      it('not found', function() {
        assert.throws(
          () => {
            remove._execute({ userId }, Random.id());
          },
          Meteor.Error,
          /brands.remove.notFound/,
        );
      });

      it('remove', function() {
        assert.equal(Brands.find().count(), 1);
        Customers.remove(customerId);

        remove._execute({ userId }, brandId);

        assert.equal(Brands.find().count(), 0);
      });
    });
  });
});
