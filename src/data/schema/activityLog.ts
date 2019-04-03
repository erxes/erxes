export const types = `
  type ActivityLogPerformerDetails {
    avatar: String
    fullName: String
    position: String
  }

  type ActivityLogActionPerformer {
    _id: String
    type: String!
    details: ActivityLogPerformerDetails
  }

  type ActivityLog {
    _id: String!
    action: String!
    id: String
    createdAt: Date!
    content: String
    by: ActivityLogActionPerformer
  }
`;

export const queries = `
  activityLogs(contentType: String!, contentId: String!, activityType: String, limit: Int): [ActivityLog]
`;
