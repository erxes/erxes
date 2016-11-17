import faker from 'faker';

import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/dburles:factory';
import { Brands } from '/imports/api/brands/brands';

class IntegrationCollections extends Mongo.Collection {}

export const Integrations = new IntegrationCollections('integrations');

Integrations.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Integrations.schema = new SimpleSchema({
  // for example in app messaging
  kind: {
    type: String,
  },

  name: {
    type: String,
  },

  brandId: {
    type: String,
  },
});

Integrations.attachSchema(Integrations.schema);

Integrations.helpers({
  brand() {
    return Brands.findOne(this.brandId);
  },
});

Integrations.publicFields = {
  name: 1,
  kind: 1,
  brandId: 1,
};

Factory.define('integration', Integrations, {
  name: () => faker.random.word(),
  kind: 'in_app_messaging',
  brandId: () => Random.id(),
});
