export const types = `
  type ActivityLog {
    _id: String
    action: String
    contentId: String
    contentType: String
    content: JSON
    createdAt: Date
    createdBy: String

    createdByDetail: JSON
    contentDetail: JSON
    contentTypeDetail: JSON
  }
`;

export const queries = `
  activityLogs(contentType: String!, contentId: String, activityType: String, limit: Int): [ActivityLog]

  activityLogsByType(contentType: String, action: String, activityType: String): JSON
`;
