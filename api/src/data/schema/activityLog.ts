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

  type ActivityLogByAction {
    _id: String
    action: String
    contentId: String
    contentType: String
    content: JSON
    createdAt: Date
    createdBy: String
    createdUser: User
    contentTypeDetail: JSON
  }

  type ActivityLogByActionResponse {
    activityLogs: [ActivityLogByAction]
    totalCount: Int
  }
`;

export const queries = `
  activityLogs(contentType: String!, contentId: String, activityType: String, limit: Int): [ActivityLog]

  activityLogsByAction(contentType: String, action: String, pipelineId: String, perPage: Int, page: Int): ActivityLogByActionResponse
`;
