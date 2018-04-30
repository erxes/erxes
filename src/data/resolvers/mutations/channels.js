import { NOTIFICATION_TYPES } from '../../constants';
import { Channels } from '../../../db/models';
import utils from '../../utils';
import { moduleRequireAdmin } from '../../permissions';

/**
 * Send notification to all members of this channel except the sender
 * @param {Object} object - Object
 * @param {string} object.channelId -   Channel id
 * @param {Array} object.memberIds - Members of the channel
 * @param {string} object.userId - Sender of the notification
 * @return {Promise}
 */
export const sendChannelNotifications = async channel => {
  const content = `You have invited to '${channel.name}' channel.`;

  return utils.sendNotification({
    createdUser: channel.userId,
    notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
    title: content,
    content,
    link: `/inbox/${channel._id}`,

    // exclude current user
    receivers: (channel.memberIds || []).filter(id => id !== channel.userId),
  });
};

const channelMutations = {
  /**
   * Create a new channel and send notifications to its members bar the creator
   * @param {Object} root
   * @param {Object} doc - Channel object
   * @param {string} doc.name - Channel name
   * @param {string} doc.description - Channel description
   * @param {String[]} doc.memberIds - Members assigned to the channel being created
   * @param {String[]} doc.integrationIds - Integrations related to the channel
   * @param {Object} object3 - Middleware data
   * @param {Object} object.user - User making this action
   * @return {Promise} return Promise resolving created Channel document
   */
  async channelsAdd(root, doc, { user }) {
    const channel = await Channels.createChannel(doc, user);

    await sendChannelNotifications(channel);

    return channel;
  },

  /**
   * Update channel data
   * @param {Object} root
   * @param {string} object2 - Channel object
   * @param {string} object2._id - Channel id
   * @param {string} object2.name - Channel name
   * @param {string} object2.description - Channel description
   * @param {string[]} object2.memberIds - Members assigned to this channel
   * @param {string[]} object2.integrationIds - Integration related to this channel
   * @param {Object} object3 - Graphql input data
   * @param {Object|string} object3.user - user making this action
   * @return {Promise} return Promise resolving the updated Channel document
   */
  async channelsEdit(root, { _id, ...doc }) {
    const channel = await Channels.updateChannel(_id, doc);

    await sendChannelNotifications(channel);

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
   */
  async channelsRemove(root, { _id }) {
    await Channels.removeChannel(_id);

    return _id;
  },
};

moduleRequireAdmin(channelMutations);

export default channelMutations;
