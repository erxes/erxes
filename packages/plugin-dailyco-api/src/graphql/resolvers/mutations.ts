import { IContext } from '@erxes/api-utils/src';
import { sendInboxMessage } from '../../messageBroker';
import { ICallRecord, Records } from '../../models';
import { sendDailyRequest } from '../../utils';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

export const publishMessage = async (
  subdomain: string,
  message: any,
  customerId?: string
) => {
  graphqlPubsub.publish(
    `conversationMessageInserted:${message.conversationId}`,
    {
      conversationMessageInserted: message
    }
  );

  // widget is listening for this subscription to show notification
  // customerId available means trying to notify to client
  if (customerId) {
    const unreadCount = await sendInboxMessage({
      subdomain,
      action: 'widgetsGetUnreadMessagesCount',
      data: {
        conversationId: message.conversationId
      },
      isRPC: true
    });

    graphqlPubsub.publish(`conversationAdminMessageInserted:${customerId}`, {
      conversationAdminMessageInserted: {
        customerId,
        unreadCount
      }
    });
  }
};

const mutations = {
  async dailySaveVideoRecordingInfo(_root, args) {
    const { roomName, recordingId } = args;

    await Records.updateOne(
      { roomName },
      { $push: { recordings: { id: recordingId } } }
    );

    return 'success';
  },

  async dailyDeleteVideoChatRoom(_root, args) {
    const callRecord = await Records.findOne({
      roomName: args.name,
      status: 'ongoing'
    });

    if (callRecord) {
      try {
        await sendDailyRequest(
          '/api/v1/rooms/' + callRecord.roomName,
          'delete',
          {},
          callRecord.subdomain
        );

        await Records.updateOne(
          { _id: callRecord._id },
          { $set: { status: 'end' } }
        );

        return true;
      } catch {
        return false;
      }
    }
  },

  dailyCreateRoom: async (_root, args, { user }: IContext) => {
    const {
      subdomain,
      contentTypeId,
      contentType = 'inbox:conversations'
    } = args;

    try {
      const roomResponse = await sendDailyRequest(
        '/api/v1/rooms',
        'post',
        { privacy: 'private' },
        subdomain
      );
      if (!roomResponse || !roomResponse.name || !roomResponse.domain_name) {
        throw new Error(
          'Failed to create room or missing required data in response'
        );
      }

      const tokenResponse = await sendDailyRequest(
        '/api/v1/meeting-tokens',
        'post',
        {
          properties: {
            room_name: roomResponse.name,
            enable_recording: 'cloud'
          }
        },
        subdomain
      );
      if (!tokenResponse || !tokenResponse.token) {
        throw new Error(
          'Failed to generate meeting token or missing token in response'
        );
      }

      const callData = {
        url: `https://${roomResponse.domain_name}.daily.co/${roomResponse.name}?t=${tokenResponse.token}`,
        name: roomResponse.name,
        status: 'ongoing'
      };

      if (contentType === 'inbox:conversations') {
        const message = await sendInboxMessage({
          subdomain,
          action: 'createOnlyMessage',
          data: {
            conversationId: contentTypeId,
            internal: false,
            contentType: 'videoCall',
            userId: user._id
          },
          isRPC: true
        });

        const updatedMessage = {
          ...message,
          videoCallData: callData
        };

        // Publish the updated message
        await publishMessage(subdomain, updatedMessage);
      }

      return callData;
    } catch (e) {
      throw new Error(e.message || 'An error occurred while creating the room');
    }
  }
};

export default mutations;
