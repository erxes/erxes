import { ICallRecord, Records } from '../../models';
import { sendDailyRequest } from '../../utils';

const mutations = {
  async dailySaveVideoRecordingInfo(_root, args) {
    const { contentType, contentTypeId, recordingId } = args;

    await Records.updateOne(
      { contentType, contentTypeId },
      { $push: { recordings: { id: recordingId } } }
    );

    return 'success';
  },

  async dailyDeleteVideoChatRoom(_root, args) {
    const callRecord = await Records.findOne({
      roomName: args.name
    });

    if (callRecord) {
      try {
        await sendDailyRequest(
          '/api/v1/rooms/' + callRecord.roomName,
          'delete',
          {},
          callRecord.subdomain
        );

        await Records.deleteOne({ _id: callRecord._id });

        return true;
      } catch {
        return false;
      }
    }
  },

  dailyCreateRoom: async (_root, args) => {
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

      const doc: ICallRecord = {
        contentTypeId,
        contentType,
        roomName: response.name,
        privacy: response.privacy,
        token: tokenResponse.token,
        status: 'ongoing'
      };

      const record = await Records.createCallRecord(doc);

      const domain_name = response.domain_name;

      // return {
      //   status: 'success',
      //   data: {
      //     url: `${domain_name}/${record.roomName}?=t${record.token}`,
      //     name: record.roomName,
      //     status: 'ongoing',
      //   },
      // };

      return {
        url: `${domain_name}/${record.roomName}?=t${record.token}`,
        name: record.roomName,
        status: 'ongoing'
      };
    } catch (e) {
      throw new Error(e.message);
    }
  }
};

export default mutations;
