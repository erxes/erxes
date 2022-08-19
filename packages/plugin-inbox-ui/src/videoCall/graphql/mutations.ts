const deleteVideoChatRoom = `
  mutation integrationsDeleteVideoChatRoom($name: String!) {
    integrationsDeleteVideoChatRoom(name: $name)
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
  mutation integrationsSaveVideoRecordingInfo($conversationId: String!, $recordingId: String!) {
    integrationsSaveVideoRecordingInfo(conversationId: $conversationId, recordingId: $recordingId)
  }
`;

export default {
  deleteVideoChatRoom,
  createVideoChatRoom,
  saveVideoRecordingInfo
};
