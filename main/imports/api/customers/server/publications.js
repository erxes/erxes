/* eslint-disable prefer-arrow-callback, new-cap */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Integrations } from '/imports/api/integrations/integrations';
import { Brands } from '/imports/api/brands/brands';
import { Customers } from '../customers';


Meteor.publishComposite('customers.list', function customersList(queryString) {
  return {
    find() {
      check(queryString, {
        brand: Match.Optional(String),
        limit: Match.Optional(Number),
        page: Match.Optional(String),
      });

      if (!this.userId) {
        return this.ready();
      }

      const selector = {};

      // filter by brand
      if (queryString.brand) {
        const integrations = Integrations.find({ brandId: queryString.brand }).fetch();
        selector.integrationId = { $in: integrations.map(i => i._id) };
      }

      const countCustomers = (name, query) => {
        Counts.publish(this, `customers.${name}`, Customers.find(query), { noReady: true });
      };

      // Count customers by brand
      Brands.find().fetch().forEach(brand => {
        const integrations = Integrations.find({ brandId: brand._id }).fetch();

        countCustomers(
          `brand.${brand._id}`,
          { integrationId: { $in: integrations.map(i => i._id) } }
        );
      });

      // Count current filtered customers
      countCustomers('list.count', selector);

      const options = {
        fields: Customers.publicFields,
        sort: { createdAt: -1 },
        limit: queryString.limit || 0,
      };

      return Customers.find(selector, options);
    },
  };
});
