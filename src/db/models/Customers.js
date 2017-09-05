import mongoose from 'mongoose';
import Random from 'meteor-random';

const CustomerSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  integrationId: String,
  name: String,
  email: String,
  phone: String,
  isUser: Boolean,
  createdAt: Date,
  internalNotes: Object,
  messengerData: Object,
  twitterData: Object,
  facebookData: Object,
});

export const Customers = mongoose.model('customers', CustomerSchema);

const SegmentSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  name: String,
  description: String,
  subOf: String,
  color: String,
  connector: String,
  conditions: Object,
});

export const Segments = mongoose.model('segments', SegmentSchema);
