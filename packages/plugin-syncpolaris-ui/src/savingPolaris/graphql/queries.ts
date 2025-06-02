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

export default {
  SyncSavingsData,
};
