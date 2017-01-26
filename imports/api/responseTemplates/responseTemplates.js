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
});

ResponseTemplates.attachSchema(ResponseTemplates.schema);
