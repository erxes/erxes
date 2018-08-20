import * as mongoose from 'mongoose';
import { createdAtModifier } from '../plugins';
import { field } from './utils';

// schema for Channels
const ChannelSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  description: field({
    type: String,
    optional: true,
  }),
  integrationIds: field({ type: [String] }),
  memberIds: field({ type: [String] }),
  userId: field({ type: String }),
  conversationCount: field({
    type: Number,
    default: 0,
  }),
  openConversationCount: field({
    type: Number,
    default: 0,
  }),
});

class Channel {
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
