import faker from 'faker';

import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Brands } from '/imports/api/brands/brands';
import { Tickets } from '/imports/api/tickets/tickets';
import { Tags } from '/imports/api/tags/tags';

const schema = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },

  name: {
    type: String,
    optional: true,
  },

  brandId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },

  createdAt: {
    type: Date,
  },

  lastSeenAt: {
    type: Date,
  },

  sessionCount: {
    type: Number,
    defaultValue: 0,
  },

  isActive: {
    type: Boolean,
    defaultValue: false,
  },

  data: {
    type: Object,
    blackbox: true,
    optional: true,
  },

  unreadCommentCount: {
    type: Number,
  },
});

class CustomersCollection extends Mongo.Collection {
  insert(doc, callback) {
    const customer = _.extend({
      createdAt: new Date(),
      unreadCommentCount: 0,
    }, doc);

    return super.insert(customer, callback);
  }

  remove(selector, callback) {
    const customers = this.find(selector).fetch();

    const result = super.remove(selector, callback);

    let removeIds = [];
    customers.forEach((obj) => {
      removeIds.push(obj.tagIds || []);
    });

    removeIds = _.uniq(_.flatten(removeIds));
    Tags.update({ _id: { $in: removeIds } }, { $inc: { objectCount: -1 } });

    return result;
  }
}

// collection
export const Customers = new CustomersCollection('customers');

Customers.attachSchema(schema);

// collection helpers
Customers.helpers({
  brand() {
    return Brands.findOne(this.brandId);
  },

  getData() {
    const results = [];
    const data = this.data || {};

    _.each(_.keys(data), (key) => {
      results.push({
        name: key.replace(/_/g, ' '),
        value: data[key],
      });
    });

    return results;
  },
});

Customers.TAG_TYPE = 'customer';

export function increaseCommentUnreadCount({ ticketId, count = 1 }) {
  const ticket = Tickets.findOne(ticketId, { fields: { customerId: 1 } });

  if (ticket) {
    Customers.update(ticket.customerId, { $inc: { unreadCommentCount: count } });
  }
}

Customers.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Customers.publicFields = {
  email: 1,
  name: 1,
  brandId: 1,
  createdAt: 1,
  lastSeenAt: 1,
  sessionCount: 1,
  isActive: 1,
  data: 1,
  unreadCommentCount: 1,
  tagIds: 1,
};

Factory.define('customer', Customers, {
  email: () => faker.internet.email(),
  brandId: () => Random.id(),
  lastSeenAt: () => new Date(),
});
