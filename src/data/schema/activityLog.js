export const types = `
  type ActivityLogYearMonthDoc {
    year: Int
    month: Int
  }

  type ActivityLogForMonth {
    date: ActivityLogYearMonthDoc!
    list: [ActivityLog]!
  }

  type ActivityLogPerformerDetails {
    avatar: String
    fullName: String
    position: String
    twitterUsername: String
  }

  type ActivityLogActionPerformer {
    _id: String
    type: String!
    details: ActivityLogPerformerDetails
  }

  type ActivityLog {
    action: String!
    id: String!
    createdAt: Date!
    content: String
    by: ActivityLogActionPerformer
  }
`;

export const queries = `
  activityLogsCustomer(_id: String!): [ActivityLogForMonth]
  activityLogsCompany(_id: String!): [ActivityLogForMonth]
`;

export const mutations = `
  activityLogsAddConversationMessageLog(customerId: String!, messageId: String!): ActivityLog
  activityLogsAddCustomerLog(
    name: String!, email: String, phone: String, customFieldsData: JSON): ActivityLog
  activityLogsAddCompanyLog(
    name: String!,
    size: Int,
    website: String,
    industry: String,
    plan: String,
    lastSeenAt: Date,
    sessionCount: Int,
    tagIds: [String]
    customFieldsData: JSON): ActivityLog
`;
