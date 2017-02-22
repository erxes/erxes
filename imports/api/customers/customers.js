import faker from 'faker';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Integrations } from '/imports/api/integrations/integrations';
import { Brands } from '/imports/api/brands/brands';
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


const facebookSchema = new SimpleSchema({
  id: {
    type: String,
  },

  profilePic: {
    type: String,
    optional: true,
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

  tagIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
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

  // facebook data
  facebookData: {
    type: facebookSchema,
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

// eslint-disable-next-line import/prefer-default-export
export const Customers = new CustomersCollection('customers');

Customers.attachSchema(schema);

// collection helpers
Customers.helpers({
  integration() {
    return Integrations.findOne(this.integrationId);
  },

  getIntegrationData() {
    return {
      inAppMessaging: this.inAppMessagingData || {},
      twitter: this.twitterData || {},
      facebook: this.facebookData || {},
    };
  },

  brand() {
    const integration = this.integration();
    return Brands.findOne(integration && integration.brandId);
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

  getTags() {
    return Tags.find({ _id: { $in: this.tagIds || [] } }).fetch();
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
  facebookData: 1,
  tagIds: 1,
};

/**
 * This fields list is used for not displaying
 * internal use fields on customer segments form.
 */
Customers.internalUseFields = ['tagIds', 'integrationId'];

Factory.define('customer', Customers, {
  email: () => faker.internet.email(),
  integrationId: () => Random.id(),
});
