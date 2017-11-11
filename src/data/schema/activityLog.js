export const types = `
  type ActivityLogYearMonthDoc {
    year: Int
    month: Int
  }

  type ActivityLogForMonth {
    date: ActivityLogYearMonthDoc!
    list: [ActivityLog]!
  }

  type ActivityLog {
    action: String!
    id: String!
    createdAt: Date!
    content: String
  }
`;

export const queries = `
  activityLogsCustomer(_id: String!): [ActivityLogForMonth]
  activityLogsCompany(_id: String!): [ActivityLogForMonth]
`;

export const mutations = `
  activitivyLogsAddConversationMessageLog(customerId: String!, messageId: String!): ActivityLog
`;
