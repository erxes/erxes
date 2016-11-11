import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

import { Brands } from '/imports/api/brands/brands';
import { Customers } from '../customers';


Meteor.publishComposite('customers.list', function customersList(queryString) {
  check(queryString, Match.OneOf(undefined, Object)); // eslint-disable-line new-cap

  if (!this.userId) {
    return { find() { this.ready(); } };
  }

  return {
    find() {
      return Customers.find({}, { fields: Customers.publicFields });
    },

    children: [{
      find(customer) {
        return Brands.find(customer.brandId, { fields: Brands.publicFields });
      },
    }],
  };
});
