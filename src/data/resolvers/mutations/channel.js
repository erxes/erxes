import { Channels } from '../../../db/models';

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
  channelsCreate(root, doc) {
    // TODO: sendNotifications method should here
    return Channels.createChannel(doc);
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
    Channels.updateChannel(_id, doc);
    // TODO: sendNotifications method shoul be here
    return;
  },

  /**
   * Remove a channel
   * @param {Object}
   * @param {String} id
   * @return {Promise} null
   */
  channelsRemove(root, { _id }) {
    return Channels.remove(_id);
  },
};
