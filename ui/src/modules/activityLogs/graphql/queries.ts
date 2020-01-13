const activityLogs = `
  query activityLogs($contentType: String!, $contentId: String!, $activityType: String, $limit: Int ) {
    activityLogs(contentType: $contentType, contentId: $contentId, activityType: $activityType, limit: $limit) {
      _id
      action
      contentId
      contentType
      content
      createdAt
      createdBy
  
      createdByDetail
      contentDetail
      contentTypeDetail
    }
  }
`;

const emailDeliveryDetail = `
  query emailDeliveryDetail($_id: String! ) {
    emailDeliveryDetail(_id: $_id ) {
      _id
      subject
      body
      to
      cc
      bcc
      attachments
      from
      kind
      userId
      customerId
      createdAt
  
      fromUser {
        _id
        details {
          avatar
          fullName
          position
        }
      }
      fromEmail
    }
  }
`;

export default {
  activityLogs,
  emailDeliveryDetail
};
