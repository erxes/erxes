/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import { Factory } from 'meteor/dburles:factory';
import { assert, chai } from 'meteor/practicalmeteor:chai';
import { PublicationCollector } from 'meteor/publication-collector';

import { Customers } from './customers';

if (Meteor.isServer) {
  require('./server/publications.js');

  describe('customers', function () {
    describe('mutators', function () {
      it('builds correctly from factory', function () {
        const customer = Factory.create('customer');
        assert.typeOf(customer, 'object');
        assert.typeOf(customer.createdAt, 'date');
        assert.typeOf(customer.email, 'string');
      });
    });

    describe('publications', function () {
      const userId = Random.id();
      const queryString = { limit: 100 };

      before(function () {
        Customers.remove({});
        _.times(3, () => Factory.create('customer'));
      });

      describe('customers.list', function () {
        it('sends all owned customers', function (done) {
          const collector = new PublicationCollector({ userId });
          collector.collect('customers.list', queryString, (collections) => {
            chai.assert.equal(collections.customers.length, 3);
            done();
          });
        });

        it('do not send customers without user', function (done) {
          const collector = new PublicationCollector();
          collector.collect('customers.list', queryString, (collections) => {
            chai.assert.equal(collections.customers, undefined);
            done();
          });
        });
      });
    });
  });
}
