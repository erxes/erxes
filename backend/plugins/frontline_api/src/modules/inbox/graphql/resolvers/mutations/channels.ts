import {
  IChannelDocument,
  IChannel,
  IChannelsEdit,
} from '@/inbox/@types/channels';
import { sendNotification } from 'erxes-api-shared/core-modules';
import { checkUserIds } from 'erxes-api-shared/utils';

import { IContext } from '~/connectionResolvers';

/**
 * Send notification to all members of this channel except the sender
 */
export const sendChannelNotifications = async (
  subdomain: string,
  channel: IChannelDocument,
  type: 'invited' | 'removed',
  user: any,
  receivers?: string[],
) => {
  let action = `invited you to the`;

  if (type === 'removed') {
    action = `removed you from`;
  }
};

export const channelMutations = {
  /**
   * Create a new channel and send notifications to its members bar the creator
   */
  async channelsAdd(
    _root,
    doc: IChannel,
    { user, models, subdomain }: IContext,
  ) {
    const channel = await models.Channels.createChannel(doc, user._id);
    await sendChannelNotifications(subdomain, channel, 'invited', user);
    sendNotification(subdomain, {
      title: 'Assigned on Channel',
      message: `You assigned on ${channel.name} channel`,
      type: 'info',
      fromUserId: user._id,
      userIds: doc.memberIds || [],
      contentType: 'frontline:inbox.channel',
      contentTypeId: (channel?._id as string) || '',
      action: 'resolved',
      priority: 'medium',
      notificationType: 'channelMembersChange',
    });

    return channel;
  },

  /**
   * Update channel data
   */
  async channelsEdit(
    _root,
    { _id, ...doc }: IChannelsEdit,
    { user, models, subdomain }: IContext,
  ) {
    const channel = await models.Channels.getChannel(_id);

    const { addedUserIds, removedUserIds } = checkUserIds(
      channel.memberIds || [],
      doc.memberIds || [],
    );

    const updated = await models.Channels.updateChannel(_id, doc);

    if (addedUserIds.length) {
      sendNotification(subdomain, {
        title: 'Assigned on Channel',
        message: `You assigned on ${channel.name} channel`,
        type: 'info',
        fromUserId: 'OQgac3z4G3I2LW9QPpAtL',
        userIds: addedUserIds,
        contentType: 'frontline:inbox.channel',
        contentTypeId: channel._id as string,
        action: 'resolved',
        priority: 'medium',
        notificationType: 'channelMembersChange',
      });
    }

    if (removedUserIds.length) {
      sendNotification(subdomain, {
        title: 'Removed from Channel',
        message: `You removed from ${channel.name} channel`,
        type: 'info',
        fromUserId: 'OQgac3z4G3I2LW9QPpAtL',
        userIds: removedUserIds,
        contentType: 'frontline:inbox.channel',
        contentTypeId: channel._id as string,
        action: 'resolved',
        priority: 'medium',
        notificationType: 'channelMembersChange',
      });
    }

    return updated;
  },

  /**
   * Remove a channel
   */
  async channelsRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext,
  ) {
    const channel = await models.Channels.getChannel(_id);
    sendNotification(subdomain, {
      title: 'Removed from Channel',
      message: `You removed from ${channel.name} channel`,
      type: 'info',
      fromUserId: 'OQgac3z4G3I2LW9QPpAtL',
      userIds: channel.memberIds || [],
      contentType: 'frontline:inbox.channel',
      contentTypeId: channel._id as string,
      action: 'resolved',
      priority: 'medium',
      notificationType: 'channelMembersChange',
    });
    await models.Channels.removeChannel(_id);
    return true;
  },
};
