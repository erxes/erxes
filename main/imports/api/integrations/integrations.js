import faker from 'faker';

import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/dburles:factory';
import { Brands } from '/imports/api/brands/brands';
import { KIND_CHOICES } from './constants';

class IntegrationCollections extends Mongo.Collection {}

export const Integrations = new IntegrationCollections('integrations');

Integrations.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

const twitterSchema = new SimpleSchema({
  id: {
    type: Number,
  },

  token: {
    type: String,
  },

  tokenSecret: {
    type: String,
  },
});

Integrations.schema = new SimpleSchema({
  // in app messaging, twitter ...
  kind: {
    type: String,
    allowedValues: KIND_CHOICES.ALL_LIST,
  },

  name: {
    type: String,
  },

  brandId: {
    type: String,
  },

  twitterData: {
    type: twitterSchema,
    optional: true,
  },
});

Integrations.attachSchema(Integrations.schema);

Integrations.helpers({
  brand() {
    return Brands.findOne(this.brandId) || {};
  },
});

Integrations.publicFields = {
  name: 1,
  kind: 1,
  brandId: 1,
};

Factory.define('integration', Integrations, {
  name: () => faker.random.word(),
  kind: KIND_CHOICES.IN_APP_MESSAGING,
  brandId: () => Random.id(),
});
