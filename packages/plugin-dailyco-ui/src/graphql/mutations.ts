const saveRecord = `
mutation DailySaveVideoRecordingInfo($contentType: String!, $contentTypeId: String!, $recordingId: String!) {
  dailySaveVideoRecordingInfo(contentType: $contentType, contentTypeId: $contentTypeId, recordingId: $recordingId)
}

`;

const deleteRoom = `
mutation DailyDeleteVideoChatRoom($name: String!) {
  dailyDeleteVideoChatRoom(name: $name)
}
`;

const createRoom = `
mutation DailyCreateRoom($contentType: String!, $contentTypeId: String!) {
  dailyCreateRoom(contentType: $contentType, contentTypeId: $contentTypeId) {
    name
    recordingLinks
    status
    url
  }
}
`;

export default {
  saveRecord,
  deleteRoom,
  createRoom
};
