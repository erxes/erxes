import faker from 'faker';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { _ } from 'meteor/underscore';
import { Factory } from 'meteor/dburles:factory';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Integrations } from '/imports/api/integrations/integrations';
import { Brands } from '/imports/api/brands/brands';
import { Tags } from '/imports/api/tags/tags';

const messengerSchema = new SimpleSchema({
  lastSeenAt: {
    type: Date,
    label: 'IAM: Last online',
  },
  sessionCount: {
    type: Number,
    label: 'IAM: Session count',
  },
  isActive: {
    type: Boolean,
    label: 'IAM: Is online',
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
    label: 'Twitter: ID (Number)',
  },
  idStr: {
    type: String,
    label: 'Twitter: ID (String)',
  },
  name: {
    type: String,
    label: 'Twitter: Name',
  },
  screenName: {
    type: String,
    label: 'Twitter: Screen name',
  },
  profileImageUrl: {
    type: String,
    label: 'Twitter: Profile photo',
  },
});

const facebookSchema = new SimpleSchema({
  id: {
    type: String,
    label: 'Facebook: ID',
  },
  profilePic: {
    type: String,
    optional: true,
    label: 'Facebook: Profile photo',
  },
});

const internalNoteSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  content: {
    type: String,
  },
  createdBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  createdDate: {
    type: Date,
  },
});

const schema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
    label: 'Name',
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true,
    label: 'Email',
  },
  isUser: {
    type: Boolean,
    label: 'Is user of one of our products',
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
    label: 'Member since',
  },
  internalNotes: {
    type: [internalNoteSchema],
    optional: true,
  },

  // Integration data
  messengerData: {
    type: messengerSchema,
    optional: true,
  },
  twitterData: {
    type: twitterSchema,
    optional: true,
  },
  facebookData: {
    type: facebookSchema,
    optional: true,
  },
});

class CustomersCollection extends Mongo.Collection {
  insert(doc, callback) {
    const customer = Object.assign({ createdAt: new Date() }, doc);

    return super.insert(customer, callback);
  }

  remove(selector, callback) {
    const customers = this.find(selector).fetch();
    const result = super.remove(selector, callback);

    // remove tags
    let removeIds = [];

    customers.forEach(obj => {
      removeIds.push(obj.tagIds || []);
    });

    removeIds = _.uniq(_.flatten(removeIds));
    Tags.update({ _id: { $in: removeIds } }, { $inc: { objectCount: -1 } });

    return result;
  }

  /**
   * Public displayable fields of customer object.
   * Only the child fields (leaf fields).
   * They're used for construct the table columns and segment filter fields.
   * @return {Array.String} Fields names
   */
  getPublicFields() {
    const schema = this.simpleSchema().schema();
    const fields = Object.keys(schema)
      .filter(key => {
        // Can't accepts below types of fields
        const unacceptedTypes = ['Object', 'Array'];
        const isAcceptedType = unacceptedTypes.indexOf(schema[key].type.name) < 0;

        // Exclude the fields which is used for internal use
        const [parentFieldName] = key.split('.');
        const notInternalUseField = this.internalUseFields.indexOf(parentFieldName) < 0;

        return isAcceptedType && notInternalUseField;
      })
      .map(key => ({
        key,
        label: schema[key].label || key,
      }));

    return fields;
  }
}

export const Customers = new CustomersCollection('customers');

Customers.attachSchema(schema);

// collection helpers
Customers.helpers({
  integration() {
    return Integrations.findOne(this.integrationId);
  },
  getIntegrationData() {
    return {
      messenger: this.messengerData || {},
      twitter: this.twitterData || {},
      facebook: this.facebookData || {},
    };
  },
  brand() {
    const integration = this.integration();
    return Brands.findOne(integration && integration.brandId);
  },
  getMessengerCustomData() {
    const results = [];
    const data = this.messengerData.customData || {};

    _.each(_.keys(data), key => {
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
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});

Customers.publicFields = {
  name: 1,
  email: 1,
  isUser: 1,
  integrationId: 1,
  createdAt: 1,
  messengerData: 1,
  twitterData: 1,
  facebookData: 1,
  tagIds: 1,
  internalNotes: 1,
};

/**
 * This fields list is used for not displaying
 * internal use fields on customer segments form.
 */
Customers.internalUseFields = ['tagIds', 'integrationId', 'internalNotes'];

Factory.define('customer', Customers, {
  email: () => faker.internet.email(),
  integrationId: () => Random.id(),
});
