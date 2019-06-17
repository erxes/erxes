import { Channels } from '../../../db/models';
import { IChannel, IChannelDocument } from '../../../db/models/definitions/channels';
import { IUserDocument } from '../../../db/models/definitions/users';
import { NOTIFICATION_TYPES } from '../../constants';
import { moduleCheckPermission } from '../../permissions';
import utils from '../../utils';

interface IChannelsEdit extends IChannel {
  _id: string;
}

/**
 * Send notification to all members of this channel except the sender
 */
export const sendChannelNotifications = async (channel: IChannelDocument) => {
  const content = `You have invited to '${channel.name}' channel.`;

  return utils.sendNotification({
    createdUser: channel.userId || '',
    notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
    title: content,
    content,
    link: `/inbox?channelId=${channel._id}`,

    // exclude current user
    receivers: (channel.memberIds || []).filter(id => id !== channel.userId),
  });
};

const channelMutations = {
  /**
   * Create a new channel and send notifications to its members bar the creator
   */
  async channelsAdd(_root, doc: IChannel, { user }: { user: IUserDocument }) {
    const channel = await Channels.createChannel(doc, user._id);

    await sendChannelNotifications(channel);

    return channel;
  },

  /**
   * Update channel data
   */
  async channelsEdit(_root, { _id, ...doc }: IChannelsEdit) {
    return Channels.updateChannel(_id, doc);
  },

  /**
   * Remove a channel
   */
  channelsRemove(_root, { _id }: { _id: string }) {
    return Channels.removeChannel(_id);
  },
};

moduleCheckPermission(channelMutations, 'manageChannels');

export default channelMutations;
