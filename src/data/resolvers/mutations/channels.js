import { Channels } from '../../../db/models';
import utils from '../../utils';

export default {
  /**
   * Create a new channel and send notifications to its members bar the creator
   * @param {Object} root
   * @param {Object} doc - Channel object
   * @param {string} doc.name - Channel name
   * @param {string} doc.description - Channel description
   * @param {String[]} doc.memberIds - Members assigned to the channel being created
   * @param {String[]} doc.integrationIds - Integrations related to the channel
   * @param {Object|string} user - User making this action
   * @return {Promise} return Promise resolving created Channel document
   * @throws {Error} throws Error('Login required') if user is not logged in
   */
  async channelsCreate(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    const channel = await Channels.createChannel(doc, user);

    await utils.sendChannelNotifications({
      userId: channel.userId,
      memberIds: channel.memberIds,
      channelId: channel._id,
    });

    return channel;
  },

  /**
   * Update channel data
   * @param {Object} root
   * @param {string} doc - Channel object
   * @param {string} doc._id - Channel id
   * @param {string} doc.name - Channel name
   * @param {string} doc.description - Channel description
   * @param {string[]} doc.memberIds - Members assigned to this channel
   * @param {string[]} doc.integrationIds - Integration related to this channel
   * @param {Object} object3 - Graphql input data
   * @param {Object|string} object3.user - user making this action
   * @return {Promise} return Promise resolving the updated Channel document
   * @throws {Error} throws Error('Login required') if user is not logged in
   */
  async channelsEdit(root, { _id, ...doc }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    const channel = Channels.updateChannel(_id, doc);

    await utils.sendChannelNotifications({
      channelId: channel._id,
      memberIds: channel.memberIds,
      userId: channel.userId,
    });

    return channel;
  },

  /**
   * Remove a channel
   * @param {Object} root
   * @param {string} object2 - Graphql input data
   * @param {string} object2._id - Channel id
   * @param {string} object3 - Middleware data
   * @param {Object|String} object3.user - User making this action
   * @return {Promise}
   * @throws {Error} throws Error('Login required') if user is not logged in
   */
  channelsRemove(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Channels.removeChannel(_id);
  },
};
