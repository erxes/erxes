const commonFields = `
  _id: String
  action: String
  contentId: String
  contentType: String
  content: JSON
  createdAt: Date
  createdBy: String
  contentTypeDetail: JSON
`;

export const types = `
  type ActivityLog {
    ${commonFields}
    createdByDetail: JSON
    contentDetail: JSON
  }

  type ActivityLogByAction {
    ${commonFields}
    createdUser: User
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
