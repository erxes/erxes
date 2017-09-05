import mongoose from 'mongoose';
import Random from 'meteor-random';

const EngageMessageSchema = mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  kind: String,
  segmentId: String,
  customerIds: [String],
  title: String,
  fromUserId: String,
  method: String,
  email: Object,
  messenger: Object,
  isDraft: Boolean,
  isLive: Boolean,
  stopDate: Date,
  messengerReceivedCustomerIds: [String],
  deliveryReports: Object,
});

const EngageMessages = mongoose.model('engage_messages', EngageMessageSchema);

export default EngageMessages;
