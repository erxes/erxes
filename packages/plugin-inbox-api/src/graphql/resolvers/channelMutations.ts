import * as _ from 'underscore';
import {
  IChannel,
  IChannelDocument
} from '../../models/definitions/channels';

import { MODULE_NAMES } from '../../constants';

import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';

import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';

// import utils, { checkUserIds } from '../../utils';
import { checkUserIds } from '@erxes/api-utils/src';
import { sendMessage } from '../../messageBroker';
import { IContext } from '../../connectionResolver';

interface IChannelsEdit extends IChannel {
  _id: string;
}

/**
 * Send notification to all members of this channel except the sender
 */
export const sendChannelNotifications = async (
  channel: IChannelDocument,
  type: 'invited' | 'removed',
//   user: IUserDocument,
  user: any,
  receivers?: string[]
) => {
  let action = `invited you to the`;

  if (type === 'removed') {
    action = `removed you from`;
  }

  return sendMessage('notifications:send', {
    contentType: 'channel',
    contentTypeId: channel._id,
    createdUser: user,
    notifType: 'channelMembersChange',
    title: `Channel updated`,
    action,
    content: `${channel.name} channel`,
    link: `/inbox/index?channelId=${channel._id}`,

    // exclude current user
    receivers:
      receivers || (channel.memberIds || []).filter(id => id !== channel.userId)
  })

};

const channelMutations = {
  /**
   * Create a new channel and send notifications to its members bar the creator
   */
  async channelsAdd(_root, doc: IChannel, { user, models }: IContext) {
    const channel = await models.Channels.createChannel(doc, user._id);

    await sendChannelNotifications(channel, 'invited', user);

    try {
      await putCreateLog(
        {
          type: MODULE_NAMES.CHANNEL,
          newData: { ...doc, userId: user._id },
          object: channel
        },
        user
      );
    } catch (e) {
      console.log(e, 'eee')
    }

    return channel;
  },

  /**
   * Update channel data
   */
  async channelsEdit(
    _root,
    { _id, ...doc }: IChannelsEdit,
    { user, models }: IContext
  ) {
    const channel = await models.Channels.getChannel(_id);

    const { addedUserIds, removedUserIds } = checkUserIds(
      channel.memberIds || [],
      doc.memberIds || []
    );

    const updated = await models.Channels.updateChannel(_id, doc);

    await sendChannelNotifications(channel, 'invited', user, addedUserIds);
    await sendChannelNotifications(channel, 'removed', user, removedUserIds);

    await putUpdateLog(
      {
        type: MODULE_NAMES.CHANNEL,
        object: channel,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    if (
      (channel.integrationIds || []).toString() !==
      (updated.integrationIds || []).toString()
    ) {
      sendMessage('registerOnboardHistory', { type: 'connectIntegrationsToChannel', user });
    }

    return updated;
  },

  /**
   * Remove a channel
   */
  async channelsRemove(_root, { _id }: { _id: string }, { user, models }: IContext) {
    const channel = await models.Channels.getChannel(_id);

    await models.Channels.removeChannel(_id);

    await sendChannelNotifications(channel, 'removed', user);

    await putDeleteLog({ type: MODULE_NAMES.CHANNEL, object: channel }, user);

    return true;
  }
};

moduleCheckPermission(channelMutations, 'manageChannels');

export default channelMutations;
