import mongoose from 'mongoose';
import Random from 'meteor-random';
import { createdAtModifier } from '../plugins';

// schema for Channels
const ChannelSchema = mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  name: String,
  description: {
    type: String,
    required: false,
  },
  integrationIds: [String],
  memberIds: [String],
  userId: String,
  conversationCount: {
    type: Number,
    default: 0,
  },
  openConversationCount: {
    type: Number,
    default: 0,
  },
});

class Channel {
  /**
   * Pre save filter method that adds userId to memberIds if it does not contain it
   * @param {Channel} doc - Channel object
   * @return {Null}
   */
  static preSave(doc) {
    // on update method userId is not supplied
    const userId = doc.userId || this.userId;

    doc.memberIds = doc.memberIds || [];

    if (!doc.memberIds.includes(userId)) {
      doc.memberIds.push(userId);
    }
  }

  /**
   * Create a new channel document
   * @param {Object} doc - Channel object
   * @param {string} doc.name - Channel name
   * @param {string} doc.description - Channel description
   * @param {string[]} doc.integrationIds - Integrations that this channel is related with
   * @param {string[]} doc.memberIds - Members assigned to this integration
   * @param {Object|String} userId - The user who is making this action
   * @return {Promise} return channel document promise
   * @throws {Error} throws Error('userId must be supplied') if userId is not supplied
   */
  static createChannel(doc, userId) {
    if (!userId) {
      throw new Error('userId must be supplied');
    }

    doc.userId = userId._id ? userId._id : userId;

    this.preSave(doc);

    return this.create(doc);
  }

  /**
   * Updates a channel document
   * @param {string} _id - Channel id
   * @param {Object} doc - Channel object
   * @param {string} doc.name - Channel name
   * @param {string} doc.description - Channel description
   * @param {string[]} doc.integrationIds - Integration ids related to the channel
   * @param {string} doc.userId - The user id or object that craeted this channel
   * @param {string[]} doc.memberIds - Member ids of the members assigned to this channel
   * @return {Promise} returns Promise resolving updated channel document
   */
  static async updateChannel(_id, doc) {
    this.preSave(doc);

    await this.update({ _id }, { $set: doc }, { runValidators: true });
    return this.findOne({});
  }

  /*
   * Update user's channels
   * @param {[String]} channelIds - User's all involved channels
   * @param {Promise} - Updated channels
   */
  static async updateUserChannels(channelIds, userId) {
    // remove from previous channels
    await this.update(
      { memberIds: { $in: [userId] } },
      { $pull: { memberIds: userId } },
      { multi: true },
    );

    // add to given channels
    await this.update(
      { _id: { $in: channelIds } },
      { $push: { memberIds: userId } },
      { multi: true },
    );

    return this.find({ _id: { $in: channelIds } });
  }

  /**
   * Removes a channel document
   * @param {string} _id - Channel id
   * @return {Promise} returns null promise
   */
  static removeChannel(_id) {
    return this.remove({ _id });
  }
}

ChannelSchema.plugin(createdAtModifier);
ChannelSchema.loadClass(Channel);

export default mongoose.model('channels', ChannelSchema);
