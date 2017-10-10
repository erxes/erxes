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
  isDraft: Boolean,
  isLive: Boolean,
  stopDate: Date,
  createdDate: Date,
  tagIds: [String],
  messengerReceivedCustomerIds: [String],

  email: Object,
  messenger: Object,
  deliveryReports: Object,
});

class Message {
  /**
   * Create engage message
   * @param  {Object} doc object
   * @return {Promise} Newly created message object
   */
  static createMessage(doc) {
    return this.create({
      ...doc,
      deliveryReports: {},
      createdUserId: doc.userId,
      createdDate: new Date(),
    });
  }

  static updateMessage(_id, doc) {
    return this.update({ _id }, { $set: doc });
  }

  static removeMessage(_id) {
    return this.remove({ _id });
  }
}

EngageMessageSchema.loadClass(Message);
const EngageMessages = mongoose.model('engage_messages', EngageMessageSchema);

export default EngageMessages;
