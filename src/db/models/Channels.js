import mongoose from 'mongoose';
import Random from 'meteor-random';
import { createdAtModifier } from '../plugins';

// schema for channel document
const ChannelSchema = mongoose.Schema({
  _id: {
    type: String,
    default: () => Random.id(),
  },
  name: String,
  description: String,
  integrationIds: [String],
  memberIds: [String],
  userId: String,
  conversationCount: Number,
  openConversationCount: Number,
});

class Channel {
  /**
   * Pre save filter method that adds userId to memberIds if it does not contain it
   */
  static preSave(doc) {
    doc.memberIds = doc.memberIds || [];

    if (!doc.memberIds.includes(doc.userId)) {
      doc.memberIds.push(doc.userId);
    }
  }

  /**
   * Create a new channel document
   * @param {String} doc.name
   * @param {String} doc.description
   * @param {Array} doc.integrationIds
   * @param {Array} doc.memberIds
   * @param {String} doc.userId
   * @return {Promise} Newly created channel document
   */
  static createChannel(doc) {
    const { userId } = doc;

    if (!userId) {
      throw new Error('userId must be supplied');
    }

    this.preSave(doc);

    doc.conversationCount = 0;
    doc.openConversationCount = 0;

    return this.create(doc);
  }

  /**
   * Updates a channel document
   * adds `userId` to the `memberIds` if it doesn't contain it
   * @param {String} doc.name
   * @param {String} doc.description
   * @param {Array} doc.integrationIds
   * @param {Array} doc.memberIds
   * @param {String} doc.userId
   * @return {Promise}
   */
  static updateChannel(_id, doc) {
    this.preSave(doc);

    return this.update({ _id }, { $set: doc }, { runValidators: true });
  }

  /**
   * Removes a channel document
   * @param {String} _id
   * @return {Promise}
   */
  static removeChannel(_id) {
    return this.remove({ _id });
  }
}

ChannelSchema.plugin(createdAtModifier);
ChannelSchema.loadClass(Channel);

export default mongoose.model('channels', ChannelSchema);
