import { repairIntegrations, updateIntegrationConfigs } from '../../helpers';
import { sendDailyRequest, VIDEO_CALL_STATUS } from '../../videoCall/controller';
import { CallRecords } from '../../videoCall/models';

const integrationMutations = {
  async integrationsUpdateConfigs(_root, { configsMap }) {
    await updateIntegrationConfigs(configsMap);

    return { status: 'ok' };
  },
  async integrationsRepair(_root, { _id }: { _id: string }) {
    await repairIntegrations(_id)

    return 'success';
  },
    // '/daily/saveRecordingInfo',
  async integrationsSaveVideoRecordingInfo(_root, { conversationId, recordingId }) {
    try {
      await CallRecords.updateOne(
        { erxesApiConversationId: conversationId, status: VIDEO_CALL_STATUS.ONGOING },
        { $push: { recordings: { id: recordingId } } }
      );
      
      return 'ok';
    } catch (e) {
      throw new Error(e.message);
    }
  },
  // '/daily/rooms/:roomName',
  async integrationsDeleteVideoChatRoom(_root, { roomName } ) {
      const callRecord = await CallRecords.findOne({
        roomName,
        status: VIDEO_CALL_STATUS.ONGOING
      });

      if (callRecord) {
        const response = await sendDailyRequest(
          `/api/v1/rooms/${callRecord.roomName}`,
          'DELETE'
        );

        await CallRecords.updateOne(
          { _id: callRecord._id },
          { $set: { status: VIDEO_CALL_STATUS.END } }
        );

        return response.deleted;
      }

      return {};
  }

};

export default integrationMutations;
