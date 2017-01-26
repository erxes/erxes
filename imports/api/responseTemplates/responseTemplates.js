import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Brands } from '/imports/api/brands/brands';

// Response template collection
class Collection extends Mongo.Collection {}


export const ResponseTemplates = new Collection('response_templates'); // eslint-disable-line import/prefer-default-export

// collection helpers
ResponseTemplates.helpers({
  brand() {
    return Brands.findOne(this.brandId);
  },
});

ResponseTemplates.schema = new SimpleSchema({
  brandId: {
    type: String,
  },

  name: {
    type: String,
  },

  content: {
    type: String,
  },

  files: {
    type: [new SimpleSchema({
      url: { type: String },
      type: { type: String, optional: true },
      name: { type: String, optional: true },
      size: { type: Number, optional: true },
    })],

    optional: true,
  },
});

ResponseTemplates.attachSchema(ResponseTemplates.schema);
