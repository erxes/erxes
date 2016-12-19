/* eslint-disable new-cap */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Brands } from '/imports/api/brands/brands';
import { Customers } from '../customers';


Meteor.publishComposite('customers.list', function customersList(queryString) {
  check(queryString, {
    limit: Match.Optional(Number),
    page: Match.Optional(String),
  });

  Counts.publish(this, 'customers.list.count', Customers.find(), { noReady: true });

  if (!this.userId) {
    return { find() { this.ready(); } };
  }

  return {
    find() {
      return Customers.find(
        {},
        {
          fields: Customers.publicFields,
          sort: { createdAt: -1 },
          limit: queryString.limit || 0,
        }
      );
    },

    children: [{
      find(customer) {
        return Brands.find(customer.brandId, { fields: Brands.publicFields });
      },
    }],
  };
});
