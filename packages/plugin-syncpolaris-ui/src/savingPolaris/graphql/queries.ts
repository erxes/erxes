const SyncSavingsData = `
  query syncSavingsData($contentType: String, $contentId: String) {
    syncSavingsData(contentType: $contentType, contentId: $contentId) {
      _id
      type
      contentType
      contentId
      createdAt
      createdBy
      consumeData
      consumeStr
      sendData
      sendStr
      header
      responseData
      responseStr
      error
      content
      createdUser
    }
  }
`;

const getPolarisData = `
  query getPolarisData($method: String, $data: JSON) {
    getPolarisData(method: $method, data: $data)
  }
`;

export default {
  SyncSavingsData,
  getPolarisData
};
