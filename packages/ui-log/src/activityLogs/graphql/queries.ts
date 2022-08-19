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

// response comes as [JSON]
const tasksAsLogs = `
  query tasksAsLogs($contentType: String!, $contentId: String!, $limit: Int) {
    tasksAsLogs(contentType: $contentType, contentId: $contentId, limit: $limit)
  }
`;

const internalNotesAsLogs = `
  query internalNotesAsLogs($contentTypeId: String!) {
    internalNotesAsLogs(contentTypeId: $contentTypeId)
  }
`;

const emailDeliveriesAsLogs = `
  query emailDeliveriesAsLogs($contentId: String!) {
    emailDeliveriesAsLogs(contentId: $contentId)
  }
`;

export default {
  activityLogs,
  emailDeliveryDetail,
  tasksAsLogs,
  internalNotesAsLogs,
  emailDeliveriesAsLogs
};
