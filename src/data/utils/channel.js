import { MODULES } from '../constants';
import { Channels } from '../../db/models';
import utils from './utils';

/**
 * Send notification to all members of this channel except the sender
 * @param {Object} object - Object
 * @param {string} object.channelId -   Channel id
 * @param {Array} object.memberIds - Members of the channel
 * @param {string} object.userId - Sender of the notification
 * @return {Promise}
 */
export default async ({ channelId, memberIds, userId }) => {
  memberIds = memberIds || [];

  const channel = await Channels.findOne({ _id: channelId });

  const content = `You have invited to '${channel.name}' channel.`;

  return utils.sendNotification({
    createdUser: userId,
    notifType: MODULES.CHANNEL_MEMBERS_CHANGE,
    title: content,
    content,
    link: `/inbox/${channel._id}`,

    // exclude current user
    receivers: memberIds.filter(id => id !== userId),
  });
};
