import { Channels } from '../../../db/models';
import { IChannel, IChannelDocument } from '../../../db/models/definitions/channels';
import { NOTIFICATION_CONTENT_TYPES, NOTIFICATION_TYPES } from '../../../db/models/definitions/constants';
import { IUserDocument } from '../../../db/models/definitions/users';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import utils, { checkUserIds, putCreateLog, putDeleteLog, putUpdateLog, registerOnboardHistory } from '../../utils';

interface IChannelsEdit extends IChannel {
  _id: string;
}

/**
 * Send notification to all members of this channel except the sender
 */
export const sendChannelNotifications = async (
  channel: IChannelDocument,
  type: 'invited' | 'removed',
  user: IUserDocument,
  receivers?: string[],
) => {
  let action = `invited you to the`;

  if (type === 'removed') {
    action = `removed you from`;
  }

  return utils.sendNotification({
    contentType: NOTIFICATION_CONTENT_TYPES.CHANNEL,
    contentTypeId: channel._id,
    createdUser: user,
    notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
    title: `Channel updated`,
    action,
    content: `${channel.name} channel`,
    link: `/inbox/index?channelId=${channel._id}`,

    // exclude current user
    receivers: receivers || (channel.memberIds || []).filter(id => id !== channel.userId),
  });
};

const channelMutations = {
  /**
   * Create a new channel and send notifications to its members bar the creator
   */
  async channelsAdd(_root, doc: IChannel, { user }: IContext) {
    const channel = await Channels.createChannel(doc, user._id);

    await sendChannelNotifications(channel, 'invited', user);

    await putCreateLog(
      {
        type: 'channel',
        newData: JSON.stringify(doc),
        object: channel,
        description: `${doc.name} has been created`,
      },
      user,
    );

    return channel;
  },

  /**
   * Update channel data
   */
  async channelsEdit(_root, { _id, ...doc }: IChannelsEdit, { user }: IContext) {
    const channel = await Channels.getChannel(_id);

    const { memberIds } = doc;

    const { addedUserIds, removedUserIds } = checkUserIds(channel.memberIds || [], memberIds || []);

    await sendChannelNotifications(channel, 'invited', user, addedUserIds);
    await sendChannelNotifications(channel, 'removed', user, removedUserIds);

    const updated = await Channels.updateChannel(_id, doc);

    await putUpdateLog(
      {
        type: 'channel',
        object: channel,
        newData: JSON.stringify(doc),
        description: `${channel.name} has been updated`,
      },
      user,
    );

    if ((channel.integrationIds || []).toString() !== (updated.integrationIds || []).toString()) {
      registerOnboardHistory({ type: 'connectIntegrationsToChannel', user });
    }

    return updated;
  },

  /**
   * Remove a channel
   */
  async channelsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const channel = await Channels.getChannel(_id);

    await sendChannelNotifications(channel, 'removed', user);

    await Channels.removeChannel(_id);

    await putDeleteLog(
      {
        type: 'channel',
        object: channel,
        description: `${channel.name} has been removed`,
      },
      user,
    );

    return true;
  },
};

moduleCheckPermission(channelMutations, 'manageChannels');

export default channelMutations;
