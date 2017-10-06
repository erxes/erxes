import { Channels } from '../../../db/models';
export default {
  /**
   * Create a new channel and send notifications to its members bar the creator
   * @param {Object}
   * @param {Object} args
   * @return {Promise} returns true
   */
  channelsCreate(root, args) {
    // TODO: sendNotifications method should here
    return Channels.createChannel(args);
  },

  /**
   * Update channel data
   * @param {Object}
   * @param {String} args.id
   * @param {Object} args
   * @return {Promise} returns mongoose model update method return value
   */
  channelsUpdate(root, args) {
    const { id } = args;
    delete args.id;
    Channels.updateChannel(id, args);
    // TODO: sendNotifications method shoul be here
    return;
  },

  /**
   * Remove a channel
   * @param {Object}
   * @param {String} id
   * @return {Promise} null
   */
  channelsRemove(root, id) {
    return Channels.remove(id);
  },
};
