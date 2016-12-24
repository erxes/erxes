/* eslint-disable prefer-arrow-callback, new-cap */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Integrations } from '/imports/api/integrations/integrations';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { Brands } from '/imports/api/brands/brands';
import { Customers } from '../customers';


Meteor.publishComposite('customers.list', function customersList(queryString) {
  return {
    find() {
      check(queryString, {
        brand: Match.Optional(String),
        integration: Match.Optional(String),
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

      // filter by integration
      if (queryString.integration) {
        const integrations = Integrations.find({ kind: queryString.integration }).fetch();

        /**
         * Since both of brand and integration filters use a same integrationId field
         * we need to intersect two arrays of integration ids.
         */
        const ids = integrations.map(i => i._id);
        const intersectionedIds = selector.integrationId
          ? _.intersection(ids, selector.integrationId.$in)
          : ids;

        selector.integrationId = { $in: intersectionedIds };
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

      // Count customers by integration
      KIND_CHOICES.ALL_LIST.forEach(integration => {
        const integrations = Integrations.find({ kind: integration }).fetch();
        countCustomers(
          `integration.${integration}`,
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
    children: [
      {
        find(customer) {
          return Integrations.find(customer.integrationId);
        },
      },
    ],
  };
});

Meteor.publishComposite('customers.details', function customersDetails(id) {
  return {
    find() {
      check(id, String);

      if (!this.userId) {
        return this.ready();
      }

      return Customers.find(id, { fields: Customers.publicFields });
    },
    children: [
      {
        find(customer) {
          return Integrations.find(customer.integrationId);
        },
      },
    ],
  };
});
