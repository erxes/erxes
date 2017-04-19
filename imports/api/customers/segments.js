import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { types, connectors, dateUnits } from './constants';

const conditionSchema = new SimpleSchema({
  field: {
    type: String,
  },
  operator: {
    type: String,
  },
  value: {
    type: String,
    optional: true,
  },
  dateUnit: {
    type: String,
    optional: true,
    allowedValues: Object.keys(dateUnits),
  },
  type: {
    type: String,
    allowedValues: Object.keys(types),
  },
});

const schema = new SimpleSchema({
  name: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  color: {
    type: String,
  },
  connector: {
    type: String,
    allowedValues: Object.keys(connectors),
  },
  conditions: {
    type: [conditionSchema],
  },
});

class SegmentsCollection extends Mongo.Collection {
  insert(doc, callback) {
    return super.insert(doc, callback);
  }

  remove(selector, callback) {
    return super.remove(selector, callback);
  }
}

const Customers = new SegmentsCollection('segments');

Customers.attachSchema(schema);

export default Customers;
