export const inputs = `
  input ActivityLogSortDoc {
    createdAt: String!
  }
`;

export const types = `
  type YearMonthDoc {
    type: String
    month: Int
  }

  type ActivityContent {
    name: String
  }

  type ActivityLogForMonth {
    date: YearMonthDoc!
    list: [ActivityLog]
  }

  type ActivityLog {
    type: String!
    action: String!
    id: String!
    createdAt: Date!
    content: ActivityContent!
  }
`;
