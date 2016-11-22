import faker from 'faker';

import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';

import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Integrations } from '/imports/api/integrations/integrations';
import { Tags } from '/imports/api/tags/tags';

const inAppMessagingSchema = new SimpleSchema({
  lastSeenAt: {
    type: Date,
  },

  sessionCount: {
    type: Number,
  },

  isActive: {
    type: Boolean,
  },

  customData: {
    type: Object,
    blackbox: true,
    optional: true,
  },
});

const twitterSchema = new SimpleSchema({
  id: {
    type: Number,
  },

  idStr: {
    type: String,
  },

  name: {
    type: String,
  },

  screenName: {
    type: String,
  },

  profileImageUrl: {
    type: String,
  },
});

const schema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },

  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true,
  },

  integrationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },

  createdAt: {
    type: Date,
  },

  // in app messaging data
  inAppMessagingData: {
    type: inAppMessagingSchema,
    optional: true,
  },

  // twitter data
  twitterData: {
    type: twitterSchema,
    optional: true,
  },
});

class CustomersCollection extends Mongo.Collection {
  insert(doc, callback) {
    const customer = _.extend({ createdAt: new Date() }, doc);

    return super.insert(customer, callback);
  }

  remove(selector, callback) {
    const customers = this.find(selector).fetch();

    const result = super.remove(selector, callback);

    // remove tags
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
  integration() {
    return Integrations.findOne(this.integrationId);
  },

  getInAppMessagingCustomData() {
    const results = [];
    const data = this.inAppMessagingData.customData || {};

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

Customers.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Customers.publicFields = {
  name: 1,
  email: 1,
  integrationId: 1,
  createdAt: 1,
  inAppMessagingData: 1,
  twitterData: 1,
  tagIds: 1,
};

Factory.define('customer', Customers, {
  email: () => faker.internet.email(),
  integrationId: () => Random.id(),
  inAppMessagingData: {},
  twitterData: {},
});
