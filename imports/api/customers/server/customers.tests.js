/* eslint-env mocha */

import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';

describe('customers', function() {
  describe('mutators', function() {
    it('builds correctly from factory', function() {
      const customer = Factory.create('customer');
      assert.typeOf(customer, 'object');
      assert.typeOf(customer.createdAt, 'date');
      assert.typeOf(customer.email, 'string');
    });
  });
});
