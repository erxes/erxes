import { Channels } from '../../../db/models';
import { sendChannelNotifications } from '../../utils';

export default {
  /**
   * Create a new channel and send notifications to its members bar the creator
   * @param {Object}
   * @param {String} doc.name
   * @param {String} doc.description
   * @param {Array} doc.memberIds
   * @param {Array} doc.integrationIds
   * @param {String} doc.userId
   * @return {Promise} returns channel object
   * @throws {Error} throws apollo level validation errors
   */
  async channelsCreate(root, doc) {
    const channel = Channels.createChannel(doc);

    sendChannelNotifications({
      userId: doc.userId,
      memberIds: doc.memberIds,
      channelId: channel._id,
    });

    return channel;
  },

  /**
   * Update channel data
   * @param {Object}
   * @param {String} doc._id
   * @param {String} doc.name
   * @param {String} doc.description
   * @param {Array} doc.memberIds
   * @param {Array} doc.integrationIds
   * @param {String} doc.userId
   * @return {Promise} returns null
   * @throws {Error} throws apollo level validation errors
   */
  channelsEdit(root, { _id, ...doc }) {
    sendChannelNotifications({
      channelId: _id,
      memberIds: doc.memberIds,
      userId: doc.userId,
    });

    return Channels.updateChannel(_id, doc);
  },

  /**
   * Remove a channel
   * @param {Object}
   * @param {String} id
   * @return {Promise} null
   */
  channelsRemove(root, { _id }) {
    return Channels.removeChannel(_id);
  },
};
