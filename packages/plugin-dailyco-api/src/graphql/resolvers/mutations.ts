import { IContext } from '@erxes/api-utils/src';
import { sendInboxMessage } from '../../messageBroker';
import { ICallRecord, Records } from '../../models';
import { sendDailyRequest } from '../../utils';
import { graphqlPubsub } from '../../configs';

export const publishMessage = async (
  subdomain: string,
  message: any,
  customerId?: string
) => {
  graphqlPubsub.publish('conversationMessageInserted', {
    conversationMessageInserted: message
  });

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

    graphqlPubsub.publish('conversationAdminMessageInserted', {
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
      const response = await sendDailyRequest(
        '/api/v1/rooms',
        'post',
        { privacy: 'private' },
        subdomain
      );

      const tokenResponse = await sendDailyRequest(
        '/api/v1/meeting-tokens',
        'post',
        {
          properties: { room_name: response.name, enable_recording: 'cloud' }
        },
        subdomain
      );

      const domain_name = response.domain_name;

      const callData = {
        url: `https://${domain_name}.daily.co/${response.name}?t=${tokenResponse.token}`,
        name: response.name,
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

        const doc: ICallRecord = {
          contentTypeId,
          contentType,
          roomName: response.name,
          privacy: response.privacy,
          token: tokenResponse.token,
          status: 'ongoing',
          messageId: message._id
        };

        await Records.createCallRecord(doc);

        const updatedMessage = {
          ...message,
          videoCallData: callData
        };

        publishMessage(subdomain, updatedMessage);
      }

      return callData;
    } catch (e) {
      throw new Error(e.message);
    }
  }
};

export default mutations;
