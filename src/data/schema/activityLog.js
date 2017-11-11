export const types = `
  type YearMonthDoc {
    year: Int
    month: Int
  }

  type ActivityLogForMonth {
    date: YearMonthDoc!
    list: [ActivityLog]!
  }

  type ActivityLog {
    action: String!
    id: String!
    createdAt: Date!
    content: String
  }
`;

export const mutations = `
  activitivyLogsAddConversationMessageLog(customerId: String!, messageId: String!): ActivityLog
`;
