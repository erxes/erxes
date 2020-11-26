const deleteVideoChatRoom = `
  mutation conversationDeleteVideoChatRoom($name: String!) {
    conversationDeleteVideoChatRoom(name: $name)
  }
`;

const createVideoChatRoom = `
  mutation conversationCreateVideoChatRoom($_id: String!) {
    conversationCreateVideoChatRoom(_id: $_id) {
      url
      name
    }
  }
`;

const saveVideoRecordingInfo = `
  mutation conversationsSaveVideoRecordingInfo($conversationId: String!, $recordingId: String!) {
    conversationsSaveVideoRecordingInfo(conversationId: $conversationId, recordingId: $recordingId)
  }
`;

export default {
  deleteVideoChatRoom,
  createVideoChatRoom,
  saveVideoRecordingInfo
};
